"use client";

import { Input } from "@/components/ui-tools/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui-tools/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui-tools/ui/dialog";
import { Button } from "@/components/ui-tools/ui/button";
import { Plus, UploadCloud, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useResourceUpload } from "./resourcesHooks";
import { updateCommunityItem, type CommunityItemType } from "@/api/community-api/community-items-endpoints";

interface ResourceUploadDialogProps {
  isOwner: boolean;
  communityId: string;
  onUploadSuccess: () => void;
  editResource?: CommunityItemType | null;
  onResourceUpdated?: (updated: CommunityItemType) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ResourceUploadDialog({
  isOwner,
  communityId,
  onUploadSuccess,
  editResource,
  onResourceUpdated,
  open: controlledOpen,
  onOpenChange,
}: ResourceUploadDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? Boolean(controlledOpen) : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const uploadHook = useResourceUpload();

  useEffect(() => {
    // Clear URL when switching to file, clear file when switching to link
    if (uploadHook.uploadKind === "file") {
      uploadHook.setField("uploadUrl", "");
    } else {
      uploadHook.setField("uploadFile", null);
    }
  }, [uploadHook.uploadKind]);

  useEffect(() => {
    if (!open) return;

    if (editResource) {
      uploadHook.setField("uploadTitle", editResource.title ?? "");
      uploadHook.setField("uploadDescription", editResource.content ?? "");

      const isLink = String(editResource.metadata?.fileType ?? "") === "LINK";
      uploadHook.setField("uploadKind", isLink ? "link" : "file");
      uploadHook.setField("uploadUrl", isLink ? String(editResource.metadata?.fileUrl ?? "") : "");
      uploadHook.setField("uploadFile", null);
    } else {
      uploadHook.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editResource, open]);

  const handleUpload = async () => {
    if (editResource) {
      // Edit mode: update title/content and URL for link resources
      const nextTitle = uploadHook.uploadTitle.trim();
      if (!nextTitle) return;

      try {
        const isLink = uploadHook.uploadKind === "link";
        const nextMetadata = {
          ...(editResource.metadata ?? {}),
          ...(isLink
            ? {
                fileType: "LINK",
                fileUrl: uploadHook.uploadUrl.trim() || undefined,
                fileName: uploadHook.uploadUrl.trim() || undefined,
                fileSize: 0,
              }
            : {}),
        };

        const updated = await updateCommunityItem(editResource.id, {
          title: nextTitle,
          content: uploadHook.uploadDescription.trim(),
          metadata: nextMetadata,
        });

        setOpen(false);
        onResourceUpdated?.(updated);
        onUploadSuccess();
      } catch (err) {
        console.error("Failed to update resource", err);
      }
      return;
    }

    const success = await uploadHook.onUploadResource(communityId);
    if (success) {
      setOpen(false);
      onUploadSuccess();
    }
  };

  if (!isOwner) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!editResource && !isControlled && (
        <DialogTrigger asChild>
          <Button variant="fill">
            <Plus /> Upload Resource
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{editResource ? "Edit Resource" : "Upload Resource"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Title"
            value={uploadHook.uploadTitle}
            onChange={(e) => uploadHook.setField("uploadTitle", e.target.value)}
            className="h-11"
          />
          <Input
            placeholder="Description (optional)"
            value={uploadHook.uploadDescription}
            onChange={(e) => uploadHook.setField("uploadDescription", e.target.value)}
            className="h-11"
          />

          {uploadHook.uploadKind === "link" ? (
            <Input
              placeholder="URL (web link)"
              value={uploadHook.uploadUrl}
              onChange={(e) => uploadHook.setField("uploadUrl", e.target.value)}
              className="h-11"
            />
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4 py-2">
                <label className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent/70 rounded-lg cursor-pointer hover:bg-primary-dark transition-all">
                  <UploadCloud size={18} />
                  Choose File
                  <input
                    type="file"
                    onChange={(e) => uploadHook.setField("uploadFile", e.target.files?.[0] ?? null)}
                    className="hidden"
                    disabled={Boolean(editResource)}
                  />
                </label>

                <div className="flex flex-col">
                  <span className="text-sm font-medium text-main truncate max-w-[200px]">
                    {uploadHook.uploadFile ? uploadHook.uploadFile.name : "No file selected"}
                  </span>
                  <span className="text-xs text-description">
                    {uploadHook.uploadFile
                      ? `${(uploadHook.uploadFile.size / 1024 / 1024).toFixed(2)} MB`
                      : "PDF, ZIP, or Images up to 10MB"}
                  </span>
                </div>

                {uploadHook.uploadFile && (
                  <button
                    onClick={() => uploadHook.setField("uploadFile", null)}
                    className="ml-auto p-1 cursor-pointer text-description hover:text-white hover:bg-error/80 transition-all rounded-md"
                    disabled={Boolean(editResource)}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          <Select
            value={uploadHook.uploadKind}
            onValueChange={(v) => uploadHook.setField("uploadKind", v as "file" | "link")}
            disabled={Boolean(editResource)}
          >
            <SelectTrigger className="min-w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="file">File</SelectItem>
              <SelectItem value="link">Link</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="grayFill">Cancel</Button>
          </DialogClose>
          <Button variant="fill" onClick={handleUpload} disabled={uploadHook.uploading || !uploadHook.uploadTitle.trim()}>
            {uploadHook.uploading ? (editResource ? "Updating..." : "Uploading...") : editResource ? "Update" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
