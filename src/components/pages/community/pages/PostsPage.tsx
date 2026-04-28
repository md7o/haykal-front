"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/shadcn_ui/input";
import { useSearch } from "@/hooks/useSearch";
import CommentsDrawer from "../options-resources/post-resource/CommentsDrawer";
import { PostCreateDialog } from "@/components/pages/community/options-resources/post-resource/PostCreateDialog";
import { PostsListSection } from "@/components/pages/community/options-resources/post-resource/PostsListSection";
import { Search } from "lucide-react";
import PagesDialog from "@/components/ui/custom_ui/DialogStorage";
import LoadingScreen from "@/components/ui/custom_ui/LoadingScreen";
import { useCommunityData } from "@/lib/context/CommunityContext";
import { usePosts } from "@/hooks/usePosts";
import { useMembership } from "@/hooks/useMembership";
import type { CommunityItemType } from "@/lib/api/community-api/community-items-endpoints";

export default function PostsPage() {
  const { communityData } = useCommunityData();
  const { isOwner, ownerMembershipId } = useMembership(communityData?.id);
  const {
    posts,
    isLoading: postsLoading,
    toggling,
    poppedId,
    load,
    handleToggleLike,
    handleDeletePost,
    addPost,
    updatePost,
  } = usePosts(communityData?.id);

  const { query, setQuery, results: filteredPosts } = useSearch(posts, { searchableFields: ["title", "content"] });

  const [commentsDrawerOpen, setCommentsDrawerOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const [editPost, setEditPost] = useState<CommunityItemType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState<string | null>(null);
  const [showDeleteLoading, setShowDeleteLoading] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  const handleEditPost = (post: CommunityItemType) => {
    setEditPost(post);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (postId: string) => {
    setPostIdToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!postIdToDelete) return;
    setDeleteDialogOpen(false);
    setShowDeleteLoading(true);
    try {
      await handleDeletePost(postIdToDelete);
    } finally {
      setShowDeleteLoading(false);
      setPostIdToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {showDeleteLoading && <LoadingScreen />}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl font-semibold text-title">Posts</h1>
          <p className="text-sm text-description mt-1">Community discussions and updates.</p>
        </div>
        <PostCreateDialog
          isOwner={isOwner}
          ownerMembershipId={ownerMembershipId}
          communityId={communityData?.id || ""}
          onPostCreated={addPost}
        />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-description" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts..."
          className="pl-9 bg-card-bg"
        />
      </div>

      <div className="flex flex-col items-center py-8">
        {postsLoading ? (
          <PostsListSection
            posts={[]}
            loading={true}
            isOwner={isOwner}
            onLike={handleToggleLike}
            onComment={(id) => {
              setSelectedPostId(id);
              setCommentsDrawerOpen(true);
            }}
            toggling={toggling}
            poppedId={poppedId}
            onEdit={handleEditPost}
            onDelete={openDeleteDialog}
          />
        ) : posts.length === 0 ? (
          <p className="text-description">{isOwner ? "No posts yet. Create one!" : "No posts yet."}</p>
        ) : filteredPosts.length === 0 ? (
          <p className="text-description">No posts match your search.</p>
        ) : (
          <PostsListSection
            posts={filteredPosts}
            loading={false}
            isOwner={isOwner}
            onLike={handleToggleLike}
            onComment={(id) => {
              setSelectedPostId(id);
              setCommentsDrawerOpen(true);
            }}
            toggling={toggling}
            poppedId={poppedId}
            onEdit={handleEditPost}
            onDelete={openDeleteDialog}
          />
        )}
      </div>

      {selectedPostId && (
        <CommentsDrawer postId={selectedPostId} isOpen={commentsDrawerOpen} onOpenChange={setCommentsDrawerOpen} />
      )}

      <PostCreateDialog
        isOwner={isOwner}
        ownerMembershipId={ownerMembershipId}
        communityId={communityData?.id || ""}
        onPostCreated={addPost}
        editPost={editPost}
        onPostUpdated={(updated) => {
          updatePost(updated);
          setEditPost(null);
        }}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <PagesDialog
        title="Delete post"
        content="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
