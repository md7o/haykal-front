import { useState, useMemo } from "react";
import { getMembershipsByUser } from "@/api/community-api/membership-endpoints";
import {
  CommunityItemTypeEnum,
  createCommunityItem,
  type CommunityItemType,
} from "@/api/community-api/community-items-endpoints";
import { uploadAsset } from "@/api/portfolios-api/sections-endpoints";

// ============ useResourceUpload Hook ============
export interface UseResourceUploadState {
  uploadTitle: string;
  uploadDescription: string;
  uploadUrl: string;
  uploadFile: File | null;
  uploadCategory: string;
  uploadKind: "file" | "link";
  uploading: boolean;
}

export const useResourceUpload = () => {
  const [state, setState] = useState<UseResourceUploadState>({
    uploadTitle: "",
    uploadDescription: "",
    uploadUrl: "",
    uploadFile: null,
    uploadCategory: "Docs",
    uploadKind: "file",
    uploading: false,
  });

  const setField = <K extends keyof UseResourceUploadState>(key: K, value: UseResourceUploadState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setState({
      uploadTitle: "",
      uploadDescription: "",
      uploadUrl: "",
      uploadFile: null,
      uploadCategory: "Docs",
      uploadKind: "file",
      uploading: false,
    });
  };

  const validateInputs = (): string | null => {
    if (!state.uploadTitle.trim()) {
      return "Title is required";
    }

    if (state.uploadKind === "link") {
      if (!state.uploadUrl.trim()) {
        return "URL is required for link type";
      }
    } else {
      if (!state.uploadFile) {
        return "File is required for file type";
      }
    }

    return null;
  };

  const onUploadResource = async (communityId: string): Promise<boolean> => {
    const validationError = validateInputs();
    if (validationError) {
      console.error(validationError);
      return false;
    }

    setState((prev) => ({ ...prev, uploading: true }));

    try {
      const memberships = await getMembershipsByUser();
      const currentMembership = memberships.find((m) => m.role === "owner") || memberships[0];

      if (!currentMembership) {
        console.error("No membership found for current user");
        return false;
      }

      let fileUrl = "";
      let fileType = "FILE";
      let fileName = "";
      let fileSize = 0;

      if (state.uploadKind === "file" && state.uploadFile) {
        try {
          const uploadedAsset = await uploadAsset(state.uploadFile);
          fileUrl = uploadedAsset.url;
          fileName = uploadedAsset.filename;
          fileType = uploadedAsset.mimetype;
          fileSize = state.uploadFile.size;
        } catch (err) {
          console.error("Failed to upload file:", err);
          return false;
        }
      }

      await createCommunityItem({
        title: state.uploadTitle.trim(),
        content: state.uploadDescription.trim(),
        membershipId: currentMembership.id,
        communityId: communityId,
        type: CommunityItemTypeEnum.RESOURCE,
        metadata:
          state.uploadKind === "link"
            ? {
                fileType: "LINK",
                fileUrl: state.uploadUrl.trim(),
                fileName: state.uploadUrl.trim(),
                fileSize: 0,
              }
            : {
                fileType,
                fileUrl,
                fileName,
                fileSize,
              },
      });

      resetForm();
      return true;
    } catch (err) {
      console.error("Failed to upload resource:", err);
      return false;
    } finally {
      setState((prev) => ({ ...prev, uploading: false }));
    }
  };

  return {
    ...state,
    setField,
    resetForm,
    onUploadResource,
    validateInputs,
  };
};

// ============ useResourceFiltering Hook ============
export const useResourceFiltering = (searchResults: CommunityItemType[], category: string) => {
  const visible = useMemo(() => {
    let items = searchResults;

    if (category !== "all") {
      if (category === "files") {
        items = items.filter((r) => (r.metadata?.fileType as any) !== "LINK");
      } else if (category === "links") {
        items = items.filter((r) => (r.metadata?.fileType as any) === "LINK");
      }
    }

    const sorted = [...items];
    sorted.sort((a, b) => {
      const aType = (a.metadata?.fileType as string) || "OTHER";
      const bType = (b.metadata?.fileType as string) || "OTHER";
      return aType.localeCompare(bType);
    });

    return sorted;
  }, [searchResults, category]);

  return visible;
};

// ============ Resource Helper ============
export const handleOpenOrDownload = async (resource: CommunityItemType) => {
  try {
    const isFile = resource.metadata?.fileType && resource.metadata.fileType !== "LINK";
    const fileUrl = resource.metadata?.fileUrl;
    const targetUrl = fileUrl || resource.content;
    if (!targetUrl) return;

    if (isFile) {
      const a = document.createElement("a");
      a.href = targetUrl;
      const filename = resource.metadata?.fileName ?? "";
      if (filename) a.download = filename;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      window.open(targetUrl, "_blank");
    }
  } catch (err) {
    console.error("Failed to open/download resource", err);
  }
};
