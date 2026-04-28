"use client";

import { useEffect, useState } from "react";
import { commentType, createComment, listComments } from "@/lib/api/community-api/userActivity-endpoints/comments-endpoints";
import { getCommentAuthor, formatRelative } from "@/lib/helpers/comment-helpers";
import { Button } from "@/components/ui/shadcn_ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/shadcn_ui/drawer";
import { Textarea } from "@/components/ui/shadcn_ui/textarea";
import { Send } from "lucide-react";

interface CommentsDrawerProps {
  postId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommentsDrawer({ postId, isOpen, onOpenChange }: CommentsDrawerProps) {
  const [comments, setComments] = useState<commentType[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState<number>(() => Date.now());

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      const data = await listComments(postId);
      setComments(data);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, postId]);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 30 * 1000); // update every 30s
    return () => clearInterval(id);
  }, []);

  const handleAddComment = async () => {
    const trimmed = commentContent.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const created = await createComment(postId, trimmed);
      setComments((prev) => [...prev, created]);
      setCommentContent("");
    } catch (err) {
      console.error("Failed to add comment", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh] flex flex-col md:items-center bg-card-main ">
        <DrawerHeader className="mb-5">
          <div className="h-1 w-12 bg-accent/30 rounded-full mx-auto mb-2" />
          <DrawerTitle>
            Comments <span className="bg-accent px-2 rounded-full text-white">{comments.length}</span>
          </DrawerTitle>
        </DrawerHeader>
        <div className="w-full h-[1px] bg-black/10 " />
        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 ">
          {commentsLoading ? (
            <p className="text-sm text-description text-center py-4">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-description text-center py-4">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-4 md:w-[40rem] w-full">
              {comments.map((comment) => {
                const author = getCommentAuthor(comment);
                const dateStr = formatRelative(comment.createdAt, now);

                return (
                  <div key={comment.id} className="px-5">
                    <div className="flex items-start gap-3 py-3 ">
                      <div className="flex-shrink-0 ">
                        {author.avatar ? (
                          <img src={author.avatar} alt={author.name} className="h-10 w-10 rounded-full  object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-card-border/30 flex items-center justify-center text-xs font-medium bg-card-bg text-title">
                            {author.initials}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center">
                          <div className="text-lg text-title">{author.name}</div>
                          <time className="text-xs text-description ml-2">{dateStr}</time>
                        </div>
                        <p
                          className="text-sm text-description leading-relaxed mt-1 break-words whitespace-pre-wrap"
                          style={{ overflowWrap: "anywhere" }}
                        >
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="py-6 px-5 md:w-[40rem] w-full flex items-center gap-2">
          <Textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Add a comment..."
            rows={1}
            className="h-14 resize-none bg-card-bg rounded-strong text-sm"
          />
          <Button
            variant="fill"
            size="flexible"
            className="h-13 rounded-strong"
            onClick={handleAddComment}
            disabled={submitting || !commentContent.trim()}
          >
            <div className="flex items-center gap-2">
              <Send size={16} />
              <span>{submitting ? "Posting..." : "Post"}</span>
            </div>
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
