"use client";

import { createCommunityData } from "@/api/community/communityData-endpoints";
import { Plus } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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

export default function CommunitySetup() {
  const { user } = useAuth();
  const [communitySlug, setCommunitySlug] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const router = useRouter();

  const slugPreview = useMemo(() => {
    const value = communitySlug.trim();
    return value ? value : "your-community";
  }, [communitySlug]);

  const handleCreateCommunity = async () => {
    if (!user) {
      console.error("No authenticated user found");
      return;
    }

    const slug = communitySlug.trim();
    if (!slug) return;

    try {
      // 1- Create community data
      const created = await createCommunityData({ slug });

      // 2- Create membership as owner
      try {
        await createMembership(created.id, "owner");
      } catch (err) {
        console.error("Failed to create membership (owner)", err);
      }

      setShowSuccess(true);
      setCommunitySlug("");

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

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Community Setup Page</h1>
        <p>Welcome to the community setup page. Here you can configure your community settings.</p>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label="Add"
            className="group w-60 h-70 cursor-pointer flex items-center justify-center border-1 border-dashed border-accent rounded-soft text-accent hover:bg-accent/10 hover:scale-105 duration-200"
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

          <div className="mt-2 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="community-slug">Community slug</Label>
              <Input
                id="community-slug"
                value={communitySlug}
                onChange={(e) => setCommunitySlug(e.target.value)}
                placeholder="haykal-community"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild onClick={handleCreateCommunity}>
              <Button disabled={!communitySlug.trim()}>Confirm</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="grayFill">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showSuccess && (
        <AlertStatus
          variant="success"
          title="Community created"
          isVisible={showSuccess}
          onClose={() => setShowSuccess(false)}
          autoHide={3000}
        />
      )}
    </div>
  );
}
