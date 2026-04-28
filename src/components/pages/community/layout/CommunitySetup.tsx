"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Presentation, Crown, Users } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/shadcn_ui/dialog";
import { Input } from "@/components/ui/shadcn_ui/input";
import { Label } from "@/components/ui/shadcn_ui/label";
import { Textarea } from "@/components/ui/shadcn_ui/textarea";
import { Button } from "@/components/ui/shadcn_ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/shadcn_ui/select";
import { COMMUNITY_TYPES, createCommunityData, getCommunityDataById } from "@/lib/api/community-api/communityData-endpoints";
import { communityDataType } from "@/lib/api/community-api/communityData-endpoints";
import { useAuthStore } from "@/lib/store/authStore";
import { createMembership, getMembershipsByUser, membershipType } from "@/lib/api/community-api/membership-endpoints";
import { CommunityType } from "@/lib/types/community";
import AlertsStatu from "@/components/ui/custom_ui/AlertsStatu";

export default function CommunitySetup() {
  const [communitySlug, setCommunitySlug] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");
  const [communityType, setCommunityType] = useState<CommunityType>("other");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [userCommunities, setUserCommunities] = useState<(communityDataType & { role: "member" | "owner" })[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const slugPreview = useMemo(() => {
    const value = communitySlug.trim();
    return value ? value : "your-community";
  }, [communitySlug]);

  const isMissingCommunityError = (error: unknown) => {
    if (!(error instanceof Error)) return false;
    const message = error.message.toLowerCase();
    return message.includes("status 404") || message.includes("not found");
  };

  const handleCreateCommunity = async () => {
    const state = useAuthStore.getState();
    if (!state.accessToken) {
      setShowLoginPrompt(true);
      return;
    }
    if (!state.user) {
      console.warn("No authenticated user found, proceeding with token only");
    }

    const slug = communitySlug.trim();
    if (!slug) return;

    try {
      // 1- Create community data
      const created = await createCommunityData({
        slug,
        description: communityDescription.trim(),
        type: communityType as CommunityType,
      });

      // 2- Create membership as owner
      try {
        await createMembership(created.id, "owner");
      } catch (err) {
        console.error("Failed to create membership (owner)", err);
      }

      setShowSuccess(true);
      setCommunitySlug("");
      setCommunityDescription("");
      setCommunityType("other");

      router.push(`/community/${slug}`);
    } catch (err) {
      console.error("Failed to create community data", err);
    }
  };

  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 3000);
    return () => clearTimeout(t);
  }, [showSuccess]);

  useEffect(() => {
    const fetchUserCommunities = async () => {
      const state = useAuthStore.getState();

      // Only fetch if user is authenticated
      if (!state.accessToken) {
        setUserCommunities([]);
        return;
      }

      try {
        setIsLoading(true);

        // 1. Get user's memberships
        const memberships = await getMembershipsByUser();

        // 2. Fetch community data for each membership
        const communitiesWithRoles = await Promise.all(
          memberships.map(async (membership: membershipType) => {
            try {
              const community = await getCommunityDataById(membership.communityId);
              return {
                ...community,
                role: membership.role,
              };
            } catch (error) {
              // Stale memberships can reference communities that were deleted; skip them quietly.
              if (!isMissingCommunityError(error)) {
                console.error(`Error fetching community ${membership.communityId}:`, error);
              }
              return null;
            }
          }),
        );

        // Filter out any null entries and sort by role (owners first)
        const validCommunities = communitiesWithRoles.filter((c) => c !== null).sort((a, b) => (a?.role === "owner" ? -1 : 1));

        setUserCommunities(validCommunities);
      } catch (error) {
        console.error("Error fetching user communities:", error);
        setUserCommunities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserCommunities();
  }, []);
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-card-main">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-title mb-2">Community Setup Page</h1>
        <p>Welcome to the community setup page. Here you can configure your community settings.</p>
      </div>

      <div className="flex justify-center items-center gap-5 flex-wrap max-w-5xl">
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label="Add"
              className="group w-60 h-70 cursor-pointer flex items-center justify-center border-1 border-dashed border-accent rounded-soft text-accent hover:bg-accent/10 hover:scale-103 duration-200"
            >
              <Plus className="group-hover:scale-120 duration-300" size={50} />
            </button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-accent">Create your community</DialogTitle>
              <DialogDescription className="text-description mt-2">
                Your community slug will appear in the URL (example:{" "}
                <span className="font-medium text-title">/community/{slugPreview}</span>).
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 grid gap-4">
              <div className="grid gap-5">
                <Label htmlFor="community-slug">Community Name</Label>
                <Input
                  id="community-slug"
                  value={communitySlug}
                  onChange={(e) => setCommunitySlug(e.target.value)}
                  placeholder="Community Name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="community-description">Community Description</Label>
                <Textarea
                  id="community-description"
                  value={communityDescription}
                  onChange={(e) => setCommunityDescription(e.target.value)}
                  placeholder="A brief description of your community"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="community-type">Community Type</Label>
                <Select value={communityType} onValueChange={(value) => setCommunityType(value as CommunityType)}>
                  <SelectTrigger id="community-type">
                    <SelectValue placeholder="Select a community type" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMUNITY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button onClick={handleCreateCommunity} disabled={!communitySlug.trim()}>
                  Confirm
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="grayFill">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex flex-wrap justify-center gap-4">
          {userCommunities.map((community) => (
            <div
              key={community.id}
              onClick={() => router.push(`/community/${community.slug}`)}
              className="group relative w-60 h-70 cursor-pointer flex flex-col justify-center items-center gap-2 bg-accent rounded-soft hover:scale-105 duration-200 transition-all shadow-md hover:shadow-lg"
            >
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                {community.role === "owner" ? (
                  <>
                    <Crown className="w-4 h-4 text-white" />
                    <span className="text-xs text-white font-semibold">Owner</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 text-white" />
                    <span className="text-xs text-white font-semibold">Member</span>
                  </>
                )}
              </div>
              <Presentation className="group-hover:scale-120 duration-300" size={40} />
              <span className="text-white text-lg font-semibold text-center px-3 line-clamp-2 capitalize">{community.slug}</span>
            </div>
          ))}
        </div>
      </div>

      {showSuccess && (
        <AlertsStatu
          variant="success"
          title="Community created"
          isVisible={showSuccess}
          onClose={() => setShowSuccess(false)}
          autoHide={3000}
        />
      )}

      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-accent">Login Required</DialogTitle>
            <DialogDescription className="text-description mt-2">
              You need to be logged in to create a community. Please log in to your account to continue.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button onClick={() => router.push("/login?next=community/setup")} className="w-full">
              Go to Login
            </Button>
            <DialogClose asChild>
              <Button variant="grayFill">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
