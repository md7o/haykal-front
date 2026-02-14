"use client";

import { EllipsisVertical, Heart, MessageCircle } from "lucide-react";
import { CommunityCardSkeleton } from "@/components/pages/community/shared/CommunityCard";
import type { CommunityItemType } from "@/api/community-api/community-items-endpoints";
import { Button } from "@/components/ui-tools/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui-tools/ui/dropdown-menu";

interface PostsListSectionProps {
  posts: CommunityItemType[];
  loading: boolean;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  toggling: Record<string, boolean>;
  poppedId: string | null;
  isOwner?: boolean;
  onEdit?: (post: CommunityItemType) => void;
  onDelete?: (postId: string) => void;
}

export const PostsListSection = ({
  posts,
  loading,
  onLike,
  onComment,
  toggling,
  poppedId,
  isOwner,
  onEdit,
  onDelete,
}: PostsListSectionProps) => {
  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <CommunityCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return <p className="text-description text-center py-8">No posts yet.</p>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {posts.map((post) => (
        <article
          key={post.id}
          className="group bg-card-bg  rounded-base shadow-sm p-6 
           hover:shadow-md  transition-all duration-300 ease-in-out 
            flex flex-col justify-between"
        >
          {/* Post Image */}
          {post.metadata?.postImage && (
            <div className="w-full max-h-100 rounded-base overflow-hidden mb-4 bg-card-bg">
              <img
                src={String(post.metadata.postImage)}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          <div>
            {/* Post Header/Title */}
            <h2 className="text-xl font-semibold text-title mb-3 transition-colors">{post.title}</h2>

            {/* Post Body */}
            <p className="text-base text-description leading-relaxed line-clamp-3">{post.content}</p>
          </div>

          {/* Post Footer */}
          <footer className="flex justify-between items-center pt-5 mt-5 text-sm text-description">
            {/* Left footer side */}
            <div className="flex flex-row-reverse items-center gap-2">
              <time className="font-medium opacity-80">
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              {/* <Button variant="transparent" size="icon" onClick={() => {}} aria-label="Open full editor">
                <EllipsisVertical />
              </Button> */}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="transparent" size="icon" onClick={() => {}} aria-label="Open full editor">
                    <EllipsisVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="start">
                  <DropdownMenuGroup>
                    {isOwner && onEdit && <DropdownMenuItem onClick={() => onEdit(post)}>Edit</DropdownMenuItem>}
                    {isOwner && onDelete && <DropdownMenuItem onClick={() => onDelete(post.id)}>Delete</DropdownMenuItem>}
                    <DropdownMenuItem>Post Report</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right footer side */}
            <div className="flex items-center gap-6">
              <button
                className={`relative cursor-pointer flex items-center gap-1.5 transition-colors active:scale-95 ${
                  post.isActive ? "text-red-500" : "hover:text-red-500"
                }`}
                onClick={() => onLike(post.id)}
                disabled={toggling[post.id]}
                aria-pressed={!!post.isActive}
                aria-label={post.isActive ? "Unlike" : "Like"}
              >
                <span className="relative z-10 flex items-center">
                  <Heart
                    size={18}
                    className={`transition-transform duration-200 ${poppedId === post.id ? "scale-110" : ""} ${
                      post.isActive ? "fill-red-400 text-red-400" : "fill-none"
                    }`}
                  />

                  <span className="font-medium ml-1">{post.likesCount}</span>
                </span>
              </button>

              <button
                className="cursor-pointer flex items-center gap-1.5 hover:text-blue-500 transition-colors"
                onClick={() => onComment(post.id)}
              >
                <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">{post.commentsCount}</span>
              </button>
            </div>
          </footer>
        </article>
      ))}
    </div>
  );
};
