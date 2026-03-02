"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/shadcn_ui/input";
import { useSearch } from "@/hooks/useSearch";
import CommentsDrawer from "./options-resources/post-resource/CommentsDrawer";
import { PostCreateDialog } from "@/components/pages/community/options-resources/post-resource/PostCreateDialog";
import { PostsListSection } from "@/components/pages/community/options-resources/post-resource/PostsListSection";
import { Search } from "lucide-react";
import PagesDialog from "@/components/ui/custom_ui/DialogStorage";
import LoadingScreen from "@/components/ui/custom_ui/LoadingScreen";
import { useCommunityData } from "@/lib/context/CommunityContext";
import {
  CommunityItemType,
  CommunityItemTypeEnum,
  deleteCommunityItem,
  getCommunityItemsByCommunity,
} from "@/lib/api/community-api/community-items-endpoints";
import { getMembershipsByUser } from "@/lib/api/community-api/membership-endpoints";
import { toggleLike } from "@/lib/api/community-api/userActivity-endpoints/likes-endpoints";

export default function PostsPage() {
  const { communityData } = useCommunityData();
  const [isOwner, setIsOwner] = useState(false);
  const [ownerMembershipId, setOwnerMembershipId] = useState<string | null>(null);
  const [userMembershipId, setUserMembershipId] = useState<string | null>(null);

  const [posts, setPosts] = useState<CommunityItemType[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [toggling, setToggling] = useState<Record<string, boolean>>({});
  const [poppedId, setPoppedId] = useState<string | null>(null);

  const [commentsDrawerOpen, setCommentsDrawerOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const [editPost, setEditPost] = useState<CommunityItemType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const {
    query,
    setQuery,
    results: filteredPosts,
  } = useSearch(posts, {
    searchableFields: ["title", "content"],
  });

  const refreshPosts = async () => {
    if (!communityData?.id) return;
    try {
      setPosts(await getCommunityItemsByCommunity(communityData.id, CommunityItemTypeEnum.POST));
    } catch (err) {
      console.error("Failed to load community items", err);
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const memberships = await getMembershipsByUser();
        if (!alive) return;

        // Get user's membership in this community (any role)
        const userMembership = memberships.find((m) => m.role === "member" || m.role === "owner");
        if (userMembership) {
          setUserMembershipId(userMembership.id);
        }

        // Check if user is an owner
        const owner = memberships.find((m) => m.role === "owner");
        if (owner) {
          setIsOwner(true);
          setOwnerMembershipId(owner.id);
        }
      } catch (err) {
        console.error("Failed to load memberships", err);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!communityData?.id || !userMembershipId) return;
    let alive = true;
    (async () => {
      try {
        setPostsLoading(true);
        const data = await getCommunityItemsByCommunity(communityData.id, CommunityItemTypeEnum.POST);
        if (!alive) return;
        setPosts(data);
      } catch (err) {
        console.error("Failed to load community items", err);
      } finally {
        setPostsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [communityData?.id, userMembershipId]);

  const handlePostCreated = (newPost: CommunityItemType) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostUpdated = (updatedPost: CommunityItemType) => {
    setPosts((prev) => prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
    setEditPost(null);
  };

  const handleEditPost = (post: CommunityItemType) => {
    setEditPost(post);
    setEditDialogOpen(true);
  };

  // Deletion/confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState<string | null>(null);
  const [showDeleteLoading, setShowDeleteLoading] = useState(false);

  const handleDeletePost = (postId: string) => {
    setPostIdToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!postIdToDelete) return;

    // Close dialog and show full-screen loading
    setDeleteDialogOpen(false);
    setShowDeleteLoading(true);

    // Keep spinner visible for a short duration for UX
    await new Promise((r) => setTimeout(r, 1000));

    // Optimistically remove from UI
    setPosts((prev) => prev.filter((post) => post.id !== postIdToDelete));

    try {
      await deleteCommunityItem(postIdToDelete);
    } catch (err) {
      console.error("Failed to delete post", err);
    }

    // Refresh posts and hide spinner
    await refreshPosts();
    setShowDeleteLoading(false);
    setPostIdToDelete(null);
  };

  const handleToggleLike = async (postId: string) => {
    if (toggling[postId]) return;

    setPoppedId(postId);
    window.setTimeout(() => setPoppedId((x) => (x === postId ? null : x)), 250);

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, isActive: !p.isActive, likesCount: p.isActive ? p.likesCount - 1 : p.likesCount + 1 } : p,
      ),
    );

    setToggling((s) => ({ ...s, [postId]: true }));
    try {
      await toggleLike(postId);
      await refreshPosts();
    } catch (err) {
      console.error("Failed to toggle like", err);
      // Revert optimistic update on failure
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isActive: !p.isActive, likesCount: p.isActive ? p.likesCount - 1 : p.likesCount + 1 } : p,
        ),
      );
    } finally {
      setToggling((s) => ({ ...s, [postId]: false }));
    }
  };

  return (
    <div className="flex flex-col gap-6 ">
      {showDeleteLoading && <LoadingScreen />}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-title">Posts</h1>
          <p className="text-sm text-description mt-1">Community discussions and updates.</p>
        </div>
        <PostCreateDialog
          isOwner={isOwner}
          ownerMembershipId={ownerMembershipId}
          communityId={communityData?.id || ""}
          onPostCreated={handlePostCreated}
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
            onDelete={handleDeletePost}
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
            onDelete={handleDeletePost}
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
        onPostCreated={handlePostCreated}
        editPost={editPost}
        onPostUpdated={handlePostUpdated}
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
        onConfirm={async () => {
          await confirmDelete();
        }}
      />
    </div>
  );
}
