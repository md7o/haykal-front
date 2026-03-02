"use client";

import { useEffect, useState } from "react";
import { Crown, User2, MessageSquare, Trash2, CalendarDays, ShieldCheck } from "lucide-react";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/shadcn_ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn_ui/tabs";
import { Button } from "@/components/ui/shadcn_ui/button";
import { Spinner } from "@/components/ui/shadcn_ui/spinner";
import { listComments, deleteComment, commentType } from "@/lib/api/community-api/userActivity-endpoints/comments-endpoints";
import { updateMembership, membershipType } from "@/lib/api/community-api/membership-endpoints";
import { cn } from "@/lib/utils";
import { CommunityItemTypeEnum, getCommunityItems } from "@/lib/api/community-api/community-items-endpoints";

// ── Props ──────────────────────────────────────────────────────────────────
interface EditMemberDialogProps {
  member: membershipType;
  communityId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemberUpdated: (updated: membershipType) => void;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function EditMemberDialog({ member, open, onOpenChange, onMemberUpdated }: EditMemberDialogProps) {
  // Role tab
  const [selectedRole, setSelectedRole] = useState<"member" | "owner">(member.role);
  const [isSavingRole, setIsSavingRole] = useState(false);

  // Comments tab
  const [comments, setComments] = useState<commentType[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Subscription tab
  const [subscriptionDate, setSubscriptionDate] = useState("");
  const [isSavingSubscription, setIsSavingSubscription] = useState(false);
  const [subscriptionSaved, setSubscriptionSaved] = useState(false);

  // Reset state when member changes or dialog opens
  useEffect(() => {
    if (!open) return;
    setSelectedRole(member.role);
    // Load subscription date from member.subscriptionExpiration
    if (member.subscriptionExpiration) {
      const date = new Date(member.subscriptionExpiration);
      const isoDate = date.toISOString().split("T")[0];
      setSubscriptionDate(isoDate);
    } else {
      setSubscriptionDate("");
    }
    setComments([]);
    fetchMemberComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, member.id, member.subscriptionExpiration]);

  // ── Fetch last 3 comments by this member across community posts ───────────
  const fetchMemberComments = async () => {
    setIsLoadingComments(true);
    try {
      const posts = await getCommunityItems(CommunityItemTypeEnum.POST);
      const allCommentArrays = await Promise.allSettled(posts.map((p) => listComments(p.id)));
      const allComments = allCommentArrays
        .filter((r): r is PromiseFulfilledResult<commentType[]> => r.status === "fulfilled")
        .flatMap((r) => r.value)
        .filter((c) => c.membership?.userId === member.userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
      setComments(allComments);
    } catch {
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // ── Save role ──────────────────────────────────────────────────────────────
  const handleSaveRole = async () => {
    if (selectedRole === member.role) return;
    setIsSavingRole(true);
    try {
      const updated = await updateMembership(member.id, { role: selectedRole });
      onMemberUpdated(updated);
    } catch (err) {
      console.error("Failed to update role:", err);
    } finally {
      setIsSavingRole(false);
    }
  };

  // ── Delete comment ─────────────────────────────────────────────────────────
  const handleDeleteComment = async (commentId: string) => {
    setDeletingId(commentId);
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Save subscription date ─────────────────────────────────────────────────
  const handleSaveSubscription = async () => {
    setIsSavingSubscription(true);
    try {
      const expirationDate = subscriptionDate ? new Date(subscriptionDate) : null;
      const updated = await updateMembership(member.id, { subscriptionExpiration: expirationDate });
      onMemberUpdated(updated);
      setSubscriptionSaved(true);
      setTimeout(() => setSubscriptionSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save subscription date:", err);
    } finally {
      setIsSavingSubscription(false);
    }
  };

  const roleChanged = selectedRole !== member.role;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl w-full max-h-[30rem] flex flex-col overflow-hidden rounded-soft">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-title">
            {member.role === "owner" ? (
              <Crown className="w-5 h-5 text-accent fill-accent" />
            ) : (
              <User2 className="w-5 h-5 text-description" />
            )}
            {member.authorName}
          </DialogTitle>
          <p className="text-sm text-description mt-1">
            Role: <span className="text-accent font-bold">{member.role === "owner" ? "Owner" : "Member"}</span>
          </p>
        </DialogHeader>

        {/* Tabs */}
        <Tabs defaultValue="role" className="flex-1 flex flex-col overflow-hidden px-6">
          <TabsList className="mb-4 w-fit">
            <TabsTrigger value="role">
              <ShieldCheck className="w-3.5 h-3.5" /> Role
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageSquare className="w-3.5 h-3.5" /> Comments
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <CalendarDays className="w-3.5 h-3.5" /> Subscription
            </TabsTrigger>
          </TabsList>

          {/* ── Role Tab ── */}
          <TabsContent value="role">
            <div className="space-y-4">
              <div className="rounded-soft bg-card-main p-5 space-y-4">
                <p className="text-sm text-description">
                  Select the role you want to assign to <strong className="text-title">{member.authorName}</strong>.
                </p>
                <div className="flex gap-3">
                  {(["member", "owner"] as const).map((role) => (
                    <Button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={cn("flex-1 ", selectedRole === role ? "" : "bg-card-main text-description hover:bg-accent/10")}
                    >
                      {role === "owner" ? <Crown className="w-4 h-4" /> : <User2 className="w-4 h-4" />}
                      <span className="capitalize font-medium text-sm">{role}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="fill" size="small" onClick={handleSaveRole} disabled={!roleChanged || isSavingRole}>
                  {isSavingRole ? <Spinner className="size-4 text-white" /> : "Save Role"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ── Comments Tab ── */}
          <TabsContent value="comments" className="flex-1 overflow-y-auto">
            {isLoadingComments ? (
              <div className="flex justify-center py-12">
                <Spinner className="size-7 text-accent" />
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <MessageSquare className="w-8 h-8 text-description opacity-40" />
                <p className="text-description text-sm">No comments found for this member.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-description">
                  Last {comments.length} comment{comments.length > 1 ? "s" : ""}
                </p>
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3 rounded-soft bg-card-main p-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-title leading-relaxed">{comment.content}</p>
                      <p className="text-xs text-description mt-1">
                        {new Date(comment.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deletingId === comment.id}
                      className="p-1.5 rounded-soft hover:bg-error/10 text-error transition-colors disabled:opacity-40 shrink-0"
                      title="Delete comment"
                    >
                      {deletingId === comment.id ? <Spinner className="size-4 text-error" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Subscription Tab ── */}
          <TabsContent value="subscription">
            <div className="space-y-4">
              <div className="rounded-soft bg-card-main p-5 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-title">Joined</p>
                  <p className="text-sm text-description">
                    {new Date(member.joinedAt).toLocaleDateString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-title" htmlFor="sub-date">
                    Subscription Expiration Date
                  </label>
                  <input
                    id="sub-date"
                    type="date"
                    value={subscriptionDate}
                    onChange={(e) => setSubscriptionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-soft bg-background text-title focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  />
                  {subscriptionDate && (
                    <p className="text-xs text-description">
                      Expires:{" "}
                      {new Date(subscriptionDate).toLocaleDateString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="fill" size="small" onClick={handleSaveSubscription} disabled={isSavingSubscription}>
                  {isSavingSubscription ? <Spinner className="size-4 text-white" /> : subscriptionSaved ? "Saved ✓" : "Save Date"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
