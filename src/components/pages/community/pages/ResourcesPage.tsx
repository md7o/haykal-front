"use client";

import { useEffect, useState } from "react";

import { useSearch } from "@/hooks/useSearch";
import { Button } from "@/components/ui/shadcn_ui/button";
import { Input } from "@/components/ui/shadcn_ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/shadcn_ui/select";
import { CommunityCard, CommunityCardSkeleton } from "@/components/pages/community/shared/CommunityCard";
import { BookOpen, Download, Search, FileText, Link as LinkIcon, EllipsisVertical } from "lucide-react";
import ResourceUploadDialog from "@/components/pages/community/options-resources/source-resource/ResourceUploadDialog";
import PagesDialog from "@/components/ui/custom_ui/DialogStorage";
import LoadingScreen from "@/components/ui/custom_ui/LoadingScreen";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn_ui/dropdown-menu";
import {
  useResourceFiltering,
  handleOpenOrDownload,
} from "@/components/pages/community/options-resources/source-resource/resourcesHooks";
import { useCommunityData } from "@/lib/context/CommunityContext";
import {
  CommunityItemType,
  CommunityItemTypeEnum,
  deleteCommunityItem,
  getCommunityItemsByCommunity,
} from "@/lib/api/community-api/community-items-endpoints";
import { useMembership } from "@/hooks/useMembership";

function formatBytes(sizeBytes?: number) {
  if (!sizeBytes || sizeBytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"] as const;
  let value = sizeBytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  const decimals = idx === 0 ? 0 : value < 10 ? 1 : 0;
  return `${value.toFixed(decimals)} ${units[idx]}`;
}

async function fetchResources(communityId: string): Promise<CommunityItemType[]> {
  try {
    return await getCommunityItemsByCommunity(communityId, CommunityItemTypeEnum.RESOURCE);
  } catch (err) {
    console.error("Failed to load resources", err);
    return [];
  }
}

export default function ResourcesPage() {
  const { communityData } = useCommunityData();
  const { isOwner } = useMembership(communityData?.id);
  const [resources, setResources] = useState<CommunityItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");

  // Edit/Delete states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceIdToDelete, setResourceIdToDelete] = useState<string | null>(null);
  const [showDeleteLoading, setShowDeleteLoading] = useState(false);
  const [editResource, setEditResource] = useState<CommunityItemType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const {
    query,
    setQuery,
    results: searchResults,
  } = useSearch(resources, {
    searchableFields: ["title", "content"],
  });

  const visible = useResourceFiltering(searchResults, category);

  const categories = ["all", "files", "links"];

  const refresh = async () => {
    if (!communityData?.id) return;
    setLoading(true);
    try {
      const data = await fetchResources(communityData.id);
      setResources(data);
    } finally {
      setLoading(false);
    }
  };

  const handleEditResource = (resource: CommunityItemType) => {
    setEditResource(resource);
    setEditDialogOpen(true);
  };

  const handleDeleteResource = (resourceId: string) => {
    setResourceIdToDelete(resourceId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!resourceIdToDelete) return;

    setDeleteDialogOpen(false);
    setShowDeleteLoading(true);

    setResources((prev) => prev.filter((r) => r.id !== resourceIdToDelete));

    try {
      await deleteCommunityItem(resourceIdToDelete);
    } catch (err) {
      console.error("Failed to delete resource", err);
    }

    await new Promise((r) => setTimeout(r, 1500));

    await refresh();
    setShowDeleteLoading(false);
    setResourceIdToDelete(null);
  };

  useEffect(() => {
    void refresh();
  }, [communityData?.id]);
  return (
    <div className="flex flex-col gap-6">
      {showDeleteLoading && <LoadingScreen />}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-soft bg-accent/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-title">Resources</h1>
            <p className="text-sm text-description">Search and manage shared files and links.</p>
          </div>
        </div>

        <ResourceUploadDialog isOwner={isOwner} communityId={communityData?.id || ""} onUploadSuccess={refresh} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-description" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources..."
            className="pl-9  bg-card-bg"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className=" min-w-[180px] bg-card-bg">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "all" ? "All" : c === "files" ? "Files" : "Links"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CommunityCardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="card-main bg-card-bg rounded-base  p-10 text-center">
          <p className="text-title font-semibold">No resources found</p>
          <p className="text-description mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((r) => {
            const isFile = r.metadata?.fileType && r.metadata.fileType !== "LINK";
            const Icon = isFile ? FileText : LinkIcon;
            return (
              <CommunityCard key={r.id} className="flex flex-col justify-between ">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Icon className=" text-accent" size={35} />
                    <div>
                      <h2 className="text-lg font-semibold text-title leading-snug">{r.title}</h2>
                      {r.content && <p className="text-sm text-description line-clamp-2">{r.content}</p>}
                    </div>
                  </div>

                  <Button variant="grayFill" onClick={() => void handleOpenOrDownload(r)}>
                    <Download />
                    {isFile ? "Download" : "Open"}
                  </Button>
                </div>

                <div className="mt-5 pt-5 border-t border-card-border/10 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2 text-description">
                    <span className="px-2 py-1 rounded-soft bg-black/5 text-title font-medium">
                      {r.metadata?.fileType ?? "FILE"}
                    </span>
                    <span className="opacity-80">{formatBytes(r.metadata?.fileSize as number)}</span>
                    <span className="opacity-60">•</span>
                    <span className="opacity-80 break-all line-clamp-1 max-w-30">{r.metadata?.fileName ?? "Resource"}</span>
                  </div>
                  <div className="flex justify-center items-center">
                    <time className="text-description opacity-80 font-medium">
                      {new Date(r.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    {isOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="transparent" size="icon" aria-label="Open resource actions">
                            <EllipsisVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-44" align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => handleEditResource(r)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteResource(r.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CommunityCard>
            );
          })}
        </div>
      )}

      <PagesDialog
        title="Delete resource"
        content="Are you sure you want to delete this resource? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={async () => {
          await confirmDelete();
        }}
      />

      <ResourceUploadDialog
        isOwner={isOwner}
        communityId={communityData?.id || ""}
        onUploadSuccess={refresh}
        editResource={editResource}
        onResourceUpdated={(updated) => {
          setResources((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
          setEditResource(null);
        }}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
}
