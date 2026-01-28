/**
 * Studio publish logic hook
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { updatePortfolio } from "@/api/portfolios-api/portfolio-endpoints";
import { updatePage } from "@/api/portfolios-api/pages-endpoints";
import { AnySectionInstance } from "@/types/sections";

interface UsePublishResult {
  isPublishing: boolean;
  publishError: string | null;
  isConfirmOpen: boolean;
  isSlugDialogOpen: boolean;
  isAuthDialogOpen: boolean;
  setIsConfirmOpen: (open: boolean) => void;
  setIsSlugDialogOpen: (open: boolean) => void;
  setIsAuthDialogOpen: (open: boolean) => void;
  handlePublishClick: () => void;
  handleConfirmPublish: () => void;
  confirmPublish: (slug?: string) => Promise<void>;
  goToSignIn: () => void;
}

export function usePublish(
  portfolioId: string | null,
  selectedPageId: string | null,
  sections: AnySectionInstance[],
  refreshPortfolioData: () => Promise<void>,
): UsePublishResult {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSlugDialogOpen, setIsSlugDialogOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const handlePublishClick = useCallback(() => {
    if (!user?.userId || !portfolioId) {
      setIsAuthDialogOpen(true);
    } else {
      setIsConfirmOpen(true);
    }
  }, [user, portfolioId]);

  const handleConfirmPublish = useCallback(() => {
    setIsConfirmOpen(false);
    setIsSlugDialogOpen(true);
  }, []);

  const confirmPublish = useCallback(
    async (slug?: string) => {
      if (!sections.length || !portfolioId) return;

      setIsPublishing(true);
      setPublishError(null);

      try {
        if (!user?.userId) {
          setIsPublishing(false);
          setIsAuthDialogOpen(true);
          return;
        }

        const sectionsPayload = sections.map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          config: s.config,
        }));

        if (selectedPageId) {
          await updatePage(portfolioId, selectedPageId, { sections: sectionsPayload });
        }

        const updatePayload: { status: "PUBLISHED"; slug?: string } = { status: "PUBLISHED" };
        if (slug) updatePayload.slug = slug;

        await updatePortfolio(portfolioId, updatePayload);

        await refreshPortfolioData();
        router.push("/dashboard/preview");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setPublishError(msg || "Failed to publish portfolio");
      } finally {
        setIsPublishing(false);
      }
    },
    [sections, portfolioId, selectedPageId, user, refreshPortfolioData, router],
  );

  const goToSignIn = useCallback(() => {
    setIsAuthDialogOpen(false);
    const redirect = encodeURIComponent("/studio");
    router.push(`/login?redirect=${redirect}`);
  }, [router]);

  return {
    isPublishing,
    publishError,
    isConfirmOpen,
    isSlugDialogOpen,
    isAuthDialogOpen,
    setIsConfirmOpen,
    setIsSlugDialogOpen,
    setIsAuthDialogOpen,
    handlePublishClick,
    handleConfirmPublish,
    confirmPublish,
    goToSignIn,
  };
}
