"use client";

import { use, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createMembership, getMembershipsByUser } from "@/api/community-api/membership-endpoints";
import { useCommunityData } from "@/context/CommunityContext";
import { Alert, AlertDescription } from "@/components/ui-tools/ui/alert";
import { Spinner } from "@/components/ui-tools/ui/spinner";
import CommunityUserCard from "@/components/pages/community/CommunityUserCard";

function normalizeCommunityTitle(slug: string) {
  const cleaned = slug.replace(/[-_]+/g, " ").trim();
  return cleaned.length ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "Community";
}

export default function JoinPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { communityData, isLoading, error } = useCommunityData();

  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(true);
  const [isCheckingMembership, setIsCheckingMembership] = useState(true);

  // Check if user already has membership
  useEffect(() => {
    const checkExistingMembership = async () => {
      if (!communityData?.id) {
        setIsCheckingMembership(false);
        return;
      }

      try {
        const memberships = await getMembershipsByUser();
        const hasMembership = memberships.some((m) => m.communityId === communityData.id);
        if (hasMembership) {
          router.replace(`/community/${slug}/feed`);
        }
      } catch {
        // If check fails, allow user to try joining
      } finally {
        setIsCheckingMembership(false);
      }
    };

    checkExistingMembership();
  }, [slug, communityData?.id, router]);

  const title = useMemo(() => normalizeCommunityTitle(slug), [slug]);
  const description = communityData?.description ?? null;
  const typeLabel = communityData?.type ?? "other";

  const handleJoin = async () => {
    setJoinError(null);

    if (!communityData?.id) {
      setJoinError("Community data is not ready yet. Please try again.");
      return;
    }

    try {
      setIsJoining(true);
      await createMembership(communityData.id, "member");
      setJoinSuccess(true);
      setDialogOpen(false);
      setTimeout(() => router.push(`/community/${slug}/feed`), 500);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Failed to join community.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-card-bg to-accent/5 p-4">
      <div className="w-full max-w-2xl">
        {isCheckingMembership ? (
          <div className="flex items-center justify-center py-12 text-description gap-2 bg-white rounded-xl shadow-2xl">
            <Spinner />
            Loading…
          </div>
        ) : error ? (
          <Alert variant="error" className="justify-start mb-4">
            <AlertDescription className="text-white">{error}</AlertDescription>
          </Alert>
        ) : null}

        {joinError && (
          <Alert variant="error" className="justify-start mb-4" closable onClose={() => setJoinError(null)}>
            <AlertDescription className="text-white">{joinError}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-description gap-2 bg-white rounded-xl shadow-2xl">
            <Spinner />
            Loading community…
          </div>
        ) : joinSuccess ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-xl shadow-2xl">
            <div className="text-center space-y-3">
              <div className="text-4xl">✓</div>
              <p className="text-xl font-semibold text-title">Welcome to {title}!</p>
              <p className="text-description">Redirecting to community…</p>
            </div>
          </div>
        ) : (
          <CommunityUserCard
            title={title}
            description={description}
            type={typeLabel}
            onJoin={handleJoin}
            isJoining={isJoining}
            joinDisabled={isJoining}
            open={dialogOpen}
          />
        )}
      </div>
    </div>
  );
}
