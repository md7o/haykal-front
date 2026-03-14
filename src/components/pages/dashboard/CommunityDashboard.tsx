"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Trash2, Pencil, Plus, MessageSquare, Crown, CalendarDays, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/shadcn_ui/button";
import { Input } from "@/components/ui/shadcn_ui/input";
import { Textarea } from "@/components/ui/shadcn_ui/textarea";
import { Skeleton } from "@/components/ui/shadcn_ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/shadcn_ui/dialog";
import { getAllMemberships, removeMembership, type membershipType } from "@/lib/api/community-api/membership-endpoints";
import {
  getCommunityDataById,
  deleteCommunityData,
  type communityDataType,
} from "@/lib/api/community-api/communityData-endpoints";
import {
  getCommunityItems,
  updateCommunityItem,
  deleteCommunityItem,
  type CommunityItemType,
  CommunityItemTypeEnum,
} from "@/lib/api/community-api/community-items-endpoints";
import { useDashboardContext } from "@/lib/context/DashboardContext";
import { relativeTime } from "@/lib/helpers/relativeTime-helpers";

type EnrichedMembership = membershipType & { communityData: communityDataType | null };
type ActivityItem = { action: string; target: string; time: string; date: Date };

export default function CommunityDashboard() {
  const [memberships, setMemberships] = useState<EnrichedMembership[]>([]);
  const [posts, setPosts] = useState<CommunityItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postSearchQuery, setPostSearchQuery] = useState("");
  const { searchQuery, setSearchQuery } = useDashboardContext();

  // Leave / delete community state
  const [leaveTarget, setLeaveTarget] = useState<EnrichedMembership | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [deleteCommunityTarget, setDeleteCommunityTarget] = useState<EnrichedMembership | null>(null);
  const [isDeletingCommunity, setIsDeletingCommunity] = useState(false);

  // Edit post state
  const [editPost, setEditPost] = useState<CommunityItemType | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete post state
  const [deletePost, setDeletePost] = useState<CommunityItemType | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const membershipsData = await getAllMemberships();

        // Enrich memberships with community data in parallel
        const enriched = await Promise.all(
          membershipsData.map(async (m): Promise<EnrichedMembership> => {
            try {
              const communityData = await getCommunityDataById(m.communityId);
              return { ...m, communityData };
            } catch {
              return { ...m, communityData: null };
            }
          }),
        );
        setMemberships(enriched);

        // Fetch all posts across the platform
        const allPosts = await getCommunityItems();
        setPosts(allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ── Leave Community ──
  const handleLeave = async () => {
    if (!leaveTarget) return;
    setIsLeaving(true);
    try {
      await removeMembership(leaveTarget.id);
      setMemberships((prev) => prev.filter((m) => m.id !== leaveTarget.id));
      setPosts((prev) => prev.filter((p) => p.membershipId !== leaveTarget.id));
      setLeaveTarget(null);
    } catch {
      // silent
    } finally {
      setIsLeaving(false);
    }
  };

  // ── Admin Delete Community ──
  const handleDeleteCommunity = async () => {
    if (!deleteCommunityTarget) return;
    setIsDeletingCommunity(true);
    try {
      await deleteCommunityData(deleteCommunityTarget.communityId);
      setMemberships((prev) => prev.filter((m) => m.id !== deleteCommunityTarget.id));
      setPosts((prev) => prev.filter((p) => p.membershipId !== deleteCommunityTarget.id));
      setDeleteCommunityTarget(null);
    } catch {
      // silent
    } finally {
      setIsDeletingCommunity(false);
    }
  };

  // ── Edit Post ──
  const openEditPost = (post: CommunityItemType) => {
    setEditPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditError("");
  };

  const handleSavePost = async () => {
    if (!editPost) return;
    setEditError("");
    setIsSavingPost(true);
    try {
      const updated = await updateCommunityItem(editPost.id, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditPost(null);
    } catch {
      setEditError("Failed to update post. Please try again.");
    } finally {
      setIsSavingPost(false);
    }
  };

  // ── Delete Post ──
  const handleDeletePost = async () => {
    if (!deletePost) return;
    setIsDeletingPost(true);
    try {
      await deleteCommunityItem(deletePost.id);
      setPosts((prev) => prev.filter((p) => p.id !== deletePost.id));
      setDeletePost(null);
    } catch {
      // silent
    } finally {
      setIsDeletingPost(false);
    }
  };

  // Activity timeline from memberships
  const activity: ActivityItem[] = memberships
    .filter((m) => m.joinedAt)
    .map((m): ActivityItem => {
      const d = new Date(m.joinedAt);
      return {
        action: m.role === "owner" ? "Created community" : "Joined community",
        target: m.communityData?.slug ?? m.communityId,
        time: relativeTime(d),
        date: d,
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6);

  const itemTypeLabel = (type: CommunityItemTypeEnum) => {
    const map: Record<CommunityItemTypeEnum, string> = {
      [CommunityItemTypeEnum.POST]: "Post",
      [CommunityItemTypeEnum.EVENT]: "Event",
      [CommunityItemTypeEnum.RESOURCE]: "Resource",
      [CommunityItemTypeEnum.COMMUNICATION]: "Communication",
    };
    return map[type] ?? type;
  };

  return (
    <div className="space-y-8">
      {/* Header */}

      <div>
        <h2 className="text-xl font-bold text-title">Communities</h2>
        <p className="text-description text-sm mt-0.5">All platform communities</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Communities", value: memberships.length, icon: Users },
          { label: "Owners", value: memberships.filter((m) => m.role === "owner").length, icon: Crown },
          { label: "Total Posts", value: posts.length, icon: MessageSquare },
        ].map((stat) => (
          <div key={stat.label} className="bg-card-bg rounded-base p-4 flex items-center gap-3">
            <div className="bg-accent/10 p-2 rounded-soft shrink-0">
              <stat.icon className="size-4 text-accent" />
            </div>
            <div>
              <p className="text-description text-xs">{stat.label}</p>
              {isLoading ? (
                <Skeleton className="h-5 w-12 rounded-soft bg-card-main mt-0.5" />
              ) : (
                <p className="text-title font-bold text-lg leading-tight">{stat.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Membership list */}
      <div className="bg-card-bg rounded-base p-5 flex flex-col gap-4">
        <h3 className="text-title font-semibold text-sm uppercase tracking-wide">All Communities</h3>
        <div className="relative bg-card-bg  rounded-soft">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-description pointer-events-none " />
          <Input
            type="search"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card-main rounded-soft focus-visible:ring-accent/40"
          />
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-soft bg-card-main" />
            ))}
          </div>
        ) : memberships.filter((m) => (m.communityData?.slug ?? m.communityId).toLowerCase().includes(searchQuery.toLowerCase()))
            .length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-description text-sm">
              {searchQuery ? `No communities matching "${searchQuery}"` : "You haven't joined any communities yet."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {memberships
              .filter((m) => (m.communityData?.slug ?? m.communityId).toLowerCase().includes(searchQuery.toLowerCase()))
              .slice(0, 3)
              .map((m) => (
                <div key={m.id} className="bg-card-main rounded-soft p-4 flex items-center gap-3">
                  <div className="flex items-center gap-3">
                    <Users className="size-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-title truncate">{m.communityData?.slug ?? m.communityId}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button asChild variant="bobble" size="icon" title="View community">
                      <Link href={`/community/${m.communityData?.slug ?? m.communityId}`}>
                        <Eye className="size-3.5" />
                      </Link>
                    </Button>
                    <Button variant="bobble" size="icon" title="Delete community" onClick={() => setDeleteCommunityTarget(m)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* My Posts */}
      <div className="bg-card-bg rounded-base p-5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-title font-semibold text-sm uppercase tracking-wide">All Posts & Content</h3>
          <span>
            {posts.filter((p) => p.type === CommunityItemTypeEnum.POST).length}{" "}
            {posts.filter((p) => p.type === CommunityItemTypeEnum.POST).length === 1 ? "Post" : "Posts"} Total
          </span>
        </div>
        <div className="relative bg-card-bg rounded-soft">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-description pointer-events-none" />
          <Input
            type="search"
            placeholder="Search posts…"
            value={postSearchQuery}
            onChange={(e) => setPostSearchQuery(e.target.value)}
            className="pl-9 bg-card-main rounded-soft focus-visible:ring-accent/40"
          />
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-soft bg-card-main" />
            ))}
          </div>
        ) : posts.filter(
            (p) =>
              p.type === CommunityItemTypeEnum.POST &&
              (p.title.toLowerCase().includes(postSearchQuery.toLowerCase()) ||
                p.content.toLowerCase().includes(postSearchQuery.toLowerCase())),
          ).length === 0 ? (
          <p className="text-description text-sm text-center py-4">
            {postSearchQuery ? `No posts matching "${postSearchQuery}"` : "No posts yet. Join a community and start sharing!"}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {posts
              .filter(
                (p) =>
                  p.type === CommunityItemTypeEnum.POST &&
                  (p.title.toLowerCase().includes(postSearchQuery.toLowerCase()) ||
                    p.content.toLowerCase().includes(postSearchQuery.toLowerCase())),
              )
              .slice(0, 4)
              .map((post) => (
                <div key={post.id} className="bg-card-main rounded-soft p-4 flex gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded-soft">
                        {itemTypeLabel(post.type)}
                      </span>
                      <span className="text-xs text-description">{relativeTime(post.createdAt)}</span>
                    </div>
                    <p className="text-sm font-semibold text-title truncate">{post.title}</p>
                    <p className="text-xs text-description mt-0.5 line-clamp-2">{post.content}</p>
                    <p className="text-xs text-description mt-1">
                      {post.likesCount} {post.likesCount === 1 ? "like" : "likes"} · {post.commentsCount}{" "}
                      {post.commentsCount === 1 ? "comment" : "comments"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      variant="transparent"
                      size="flexible"
                      className="text-description hover:text-accent rounded-soft p-1.5"
                      title="Edit post"
                      onClick={() => openEditPost(post)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="transparent"
                      size="flexible"
                      className="text-description hover:text-error rounded-soft p-1.5"
                      title="Delete post"
                      onClick={() => setDeletePost(post)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Community Activity */}
      <div className="bg-card-bg rounded-base p-5 flex flex-col gap-4">
        <h3 className="text-title font-semibold text-sm uppercase tracking-wide">Community Activity</h3>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-soft bg-card-main" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <p className="text-description text-sm text-center py-4">No activity recorded yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-light-border">
            {activity.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-accent shrink-0" />
                  <div>
                    <p className="text-sm text-title leading-tight">{item.action}</p>
                    <p className="text-xs text-description mt-0.5">{item.target}</p>
                  </div>
                </div>
                <span className="text-xs text-description shrink-0 ml-4">{item.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Leave Community Dialog ── */}
      <Dialog open={!!leaveTarget} onOpenChange={(open) => !open && setLeaveTarget(null)}>
        <DialogContent className="bg-card-bg rounded-base">
          <DialogHeader>
            <DialogTitle className="text-title">Leave Community</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave{" "}
              <strong className="text-title">"{leaveTarget?.communityData?.slug ?? leaveTarget?.communityId}"</strong>? You will
              lose access to its content.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="grayFill" size="small" className="rounded-soft" onClick={() => setLeaveTarget(null)}>
              Cancel
            </Button>
            <Button
              size="small"
              className="rounded-soft bg-error hover:opacity-80 text-white"
              onClick={handleLeave}
              disabled={isLeaving}
            >
              {isLeaving ? "Leaving…" : "Leave Community"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Admin Delete Community Dialog ── */}
      <Dialog open={!!deleteCommunityTarget} onOpenChange={(open) => !open && setDeleteCommunityTarget(null)}>
        <DialogContent className="bg-card-bg rounded-base">
          <DialogHeader>
            <DialogTitle className="text-title">Delete Community</DialogTitle>
            <DialogDescription>
              <strong className="text-error">Admin action.</strong> This will permanently delete{" "}
              <strong className="text-title">
                "{deleteCommunityTarget?.communityData?.slug ?? deleteCommunityTarget?.communityId}"
              </strong>{" "}
              and all of its content. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="grayFill" size="small" className="rounded-soft" onClick={() => setDeleteCommunityTarget(null)}>
              Cancel
            </Button>
            <Button
              size="small"
              className="rounded-soft bg-error hover:opacity-80 text-white"
              onClick={handleDeleteCommunity}
              disabled={isDeletingCommunity}
            >
              {isDeletingCommunity ? "Deleting…" : "Delete Community"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Post Dialog ── */}
      <Dialog open={!!editPost} onOpenChange={(open) => !open && setEditPost(null)}>
        <DialogContent className="bg-card-bg rounded-base">
          <DialogHeader>
            <DialogTitle className="text-title">Edit Post</DialogTitle>
            <DialogDescription>Update the title and content of your post.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              value={editTitle}
              onChange={(e) => {
                setEditTitle(e.target.value);
                setEditError("");
              }}
              placeholder="Post title"
              className="bg-card-main rounded-soft border-0 focus-visible:ring-accent/40 text-title"
            />
            <Textarea
              value={editContent}
              onChange={(e) => {
                setEditContent(e.target.value);
                setEditError("");
              }}
              placeholder="Post content"
              rows={4}
              className="bg-card-main rounded-soft text-title text-sm resize-none"
            />
            {editError && <p className="text-error text-xs">{editError}</p>}
          </div>
          <DialogFooter>
            <Button variant="grayFill" size="small" className="rounded-soft" onClick={() => setEditPost(null)}>
              Cancel
            </Button>
            <Button
              variant="fill"
              size="small"
              className="rounded-soft"
              onClick={handleSavePost}
              disabled={isSavingPost || !editTitle.trim() || !editContent.trim()}
            >
              {isSavingPost ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Post Dialog ── */}
      <Dialog open={!!deletePost} onOpenChange={(open) => !open && setDeletePost(null)}>
        <DialogContent className="bg-card-bg rounded-base">
          <DialogHeader>
            <DialogTitle className="text-title">Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong className="text-title">"{deletePost?.title}"</strong>? This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="grayFill" size="small" className="rounded-soft" onClick={() => setDeletePost(null)}>
              Cancel
            </Button>
            <Button
              size="small"
              className="rounded-soft bg-error hover:opacity-80 text-white"
              onClick={handleDeletePost}
              disabled={isDeletingPost}
            >
              {isDeletingPost ? "Deleting…" : "Delete Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
