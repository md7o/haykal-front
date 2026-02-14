"use client";

import { useEffect, useState } from "react";
import { Trash2, Crown, Edit, User2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getAllMemberships, removeMembership } from "@/api/community-api/membership-endpoints";
import type { membershipType } from "@/api/community-api/membership-endpoints";
import { countCommentsByUser } from "@/api/community-api/userActivity-endpoints/comments-endpoints";
import { useCommunityData } from "@/context/CommunityContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui-tools/ui/table";
import { cn } from "@/lib/utils";

interface ManageMembersContentProps {
  slug: string;
}

interface MemberWithActivity extends membershipType {
  commentsCount?: number;
}

export default function ManageMembersContent({ slug }: ManageMembersContentProps) {
  const user = useAuthStore((state) => state.user);
  const { communityData } = useCommunityData();
  const [members, setMembers] = useState<MemberWithActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    const loadMembers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const allMemberships = await getAllMemberships();
        // Filter memberships for this community
        const communityMembers = communityData ? allMemberships.filter((m) => m.communityId === communityData.id) : [];

        // Fetch current authenticated user's comments count once,
        // then attach it only to that member's row.
        let currentUserComments = 0;
        try {
          if (user) {
            currentUserComments = await countCommentsByUser();
          }
        } catch (err) {
          console.error("Failed to load current user's comments count:", err);
        }

        const membersWithActivity = communityMembers.map((member) => ({
          ...member,
          commentsCount: member.userId === user?.userId ? currentUserComments : 0,
        }));

        setMembers(membersWithActivity);
      } catch (err) {
        console.error("Failed to load members:", err);
        setError(err instanceof Error ? err.message : "Failed to load members");
      } finally {
        setIsLoading(false);
      }
    };

    loadMembers();
  }, [slug, communityData]);

  const handleRemoveMember = async (membershipId: string) => {
    if (!confirm("Are you sure you want to remove this member from the community?")) {
      return;
    }

    setActionInProgress(membershipId);
    try {
      await removeMembership(membershipId);
      setMembers((prev) => prev.filter((m) => m.id !== membershipId));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to remove member";
      console.error(errorMsg);
      alert(errorMsg);
    } finally {
      setActionInProgress(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-description">Loading members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card-bg rounded-base p-4 ">
        <p className="text-error text-sm">Error: {error}</p>
      </div>
    );
  }

  const owners = members.filter((m) => m.role === "owner");
  const nonOwners = members.filter((m) => m.role !== "owner");
  // Render a single combined table with owners first
  const combinedMembers = [...owners, ...nonOwners];

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl text-title mb-1">Manage Members</h1>
        <p className="text-description">
          {members.length} {members.length === 1 ? "member" : "members"} in this community
        </p>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-description">No members found in this community</p>
        </div>
      ) : (
        <section className="space-y-3 px-20">
          <div className="flex items-center gap-2">
            <h2 className="text-lg text-title">Members ({combinedMembers.length})</h2>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-center">Comments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {combinedMembers.map((member) => {
                const isCurrentUser = user?.userId === member.userId;
                const isOwner = member.role === "owner";
                const isMember = member.role === "member";
                const userIdSnippet = member.authorName;
                const joinDate = new Date(member.joinedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <TableRow key={member.id} className={isOwner ? "bg-accent/5" : ""}>
                    <TableCell className="text-title">
                      <div className="flex items-center gap-2">
                        {isOwner && <Crown className="w-4 h-4 text-accent fill-accent" />}
                        {isMember && <User2 className="w-4 h-4 text-description fill-description" />}
                        {userIdSnippet}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-soft text-xs ",
                          isOwner ? "bg-accent/15 text-accent" : "bg-description/10 text-description",
                        )}
                      >
                        {isOwner ? "Owner" : "Member"}
                      </span>
                    </TableCell>
                    <TableCell className="text-description text-sm">{joinDate}</TableCell>
                    <TableCell className="text-center text-description text-sm">{member.commentsCount ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isCurrentUser && (
                          <>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={actionInProgress === member.id}
                              className={cn(
                                "p-1.5 transition-colors",
                                "hover:bg-error/10 rounded-soft",
                                "text-error",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                              )}
                              title="Remove member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={actionInProgress === member.id}
                              className={cn(
                                "p-1.5 transition-colors",
                                "hover:bg-accent/10 rounded-soft",
                                "text-accent",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                              )}
                              title="Edit member"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
      )}
    </div>
  );
}
