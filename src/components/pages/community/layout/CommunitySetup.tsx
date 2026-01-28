"use client";

import {
  createCommunityData,
  getAllCommunityData,
  communityDataType,
  COMMUNITY_TYPES,
  CommunityType,
} from "@/api/community/communityData-endpoints";
import { Plus, Presentation } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui-tools/ui/dialog";
import { Button } from "@/components/ui-tools/ui/button";
import { Input } from "@/components/ui-tools/ui/input";
import { Label } from "@/components/ui-tools/ui/label";
import AlertStatus from "@/components/ui-tools/custom_ui/AlertStatues";
import { createMembership } from "@/api/community/membership-endpoints";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui-tools/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui-tools/ui/select";

export default function CommunitySetup() {
  const user = useAuthStore((state) => state.user);
  const [communitySlug, setCommunitySlug] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");
  const [communityType, setCommunityType] = useState<CommunityType>("other");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [existingCommunities, setExistingCommunities] = useState<communityDataType[]>([]);

  const router = useRouter();

  const slugPreview = useMemo(() => {
    const value = communitySlug.trim();
    return value ? value : "your-community";
  }, [communitySlug]);

  const handleCreateCommunity = async () => {
    const { hasHydrated, accessToken, user: currentUser } = useAuthStore.getState();

    if (!hasHydrated) {
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (useAuthStore.getState().hasHydrated) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
      });
    }

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
    const fetchCommunities = async () => {
      try {
        const communities = await getAllCommunityData();
        setExistingCommunities(communities);
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    };

    fetchCommunities();
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
          {existingCommunities.map((community) => (
            <div
              key={community.id}
              onClick={() => router.push(`/community/${community.slug}`)}
              className="group w-60 h-70 cursor-pointer flex flex-col justify-center items-center gap-2 bg-accent rounded-soft hover:scale-105 duration-200 transition-all shadow-md hover:shadow-lg"
            >
              <Presentation className="group-hover:scale-120 duration-300" size={40} />
              <span className="text-white text-lg font-semibold text-center px-3 line-clamp-2 capitalize">{community.slug}</span>
            </div>
          ))}
        </div>
      </div>

      {showSuccess && (
        <AlertStatus
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
