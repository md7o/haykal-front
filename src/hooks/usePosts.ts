import { useState, useCallback, useEffect } from "react";
import {
  getCommunityItemsByCommunity,
  CommunityItemTypeEnum,
  deleteCommunityItem,
  type CommunityItemType,
} from "@/lib/api/community-api/community-items-endpoints";
import { toggleLike } from "@/lib/api/community-api/userActivity-endpoints/likes-endpoints";

export function usePosts(communityId: string | undefined) {
  const [posts, setPosts] = useState<CommunityItemType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toggling, setToggling] = useState<Record<string, boolean>>({});
  const [poppedId, setPoppedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!communityId) return;
    setIsLoading(true);
    try {
      const data = await getCommunityItemsByCommunity(communityId, CommunityItemTypeEnum.POST);
      setPosts(data);
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      setIsLoading(false);
    }
  }, [communityId]);

  const handleToggleLike = useCallback(
    async (postId: string) => {
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
        await load();
      } catch {
        // Revert optimistic update on failure
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, isActive: !p.isActive, likesCount: p.isActive ? p.likesCount - 1 : p.likesCount + 1 } : p,
          ),
        );
      } finally {
        setToggling((s) => ({ ...s, [postId]: false }));
      }
    },
    [toggling, load],
  );

  const handleDeletePost = useCallback(
    async (postId: string) => {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      try {
        await deleteCommunityItem(postId);
      } catch (err) {
        console.error("Failed to delete post", err);
        await load(); // revert by re-fetching
      }
    },
    [load],
  );

  const addPost = useCallback((post: CommunityItemType) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const updatePost = useCallback((updated: CommunityItemType) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  return { posts, isLoading, toggling, poppedId, load, handleToggleLike, handleDeletePost, addPost, updatePost };
}
