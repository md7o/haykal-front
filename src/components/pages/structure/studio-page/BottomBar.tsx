"use client";

import React from "react";
import { ResponsiveBar } from "@/components/layouts/ResponsiveBar";
import { useSidebar } from "@/components/ui/sidebar";
import { Sidebar, Upload } from "lucide-react";
import { useStudio } from "@/context/StudioContext";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { createCustomDesign, updatePortfolio, getAllPortfolios, createPortfolio } from "@/api/portfolio-endpoints";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function BottomBar() {
  const { setOpenMobile } = useSidebar();
  const [, setActive] = React.useState<string>("StudioSidebar");
  const { used, customDesignId } = useStudio();
  // structure selection removed; portfolios no longer require category/layout
  const [isPublishing, setIsPublishing] = useState(false);
  const [, setPublishError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const publicPortfolio = async () => {
    if (!used.length) return;
    setIsPublishing(true);
    setPublishError(null);
    try {
      if (!user?.userId) {
        setIsPublishing(false);
        setIsAuthDialogOpen(true);
        return;
      }
      let portfolioId: string | null = null;
      try {
        const all = await getAllPortfolios();
        const mine = all.filter((p: any) => {
          const uid = typeof p.userId === "string" ? p.userId : typeof p.user === "string" ? p.user : p.user?.id;
          return String(uid) === String(user.userId);
        });
        if (mine.length) {
          mine.sort(
            (a: any, b: any) =>
              new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
          );
          portfolioId = mine[0].id;
        }
      } catch {}
      if (!portfolioId) {
        const createdPortfolio = await createPortfolio({ userId: user.userId });
        portfolioId = createdPortfolio.id;
      }

      const sectionsPayload = used.map((s) => ({ type: s.type, config: s.config } as { type: string; config: unknown }));
      const existingId = customDesignId || portfolioId;
      if (existingId) await updatePortfolio(existingId, { sections: sectionsPayload });
      else await createCustomDesign({ portfolioId, sections: sectionsPayload });

      router.push("/dashboard/sections");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPublishError(msg || "Failed to create portfolio");
    } finally {
      setIsPublishing(false);
    }
  };

  const items = [
    {
      id: "StudioSidebar",
      label: "Sections",
      icon: <Sidebar size={25} />,
      onClick: () => {
        setOpenMobile(true);
      },
    },
    {
      id: "create",
      label: customDesignId ? "Update" : "Create",
      icon: <Upload size={25} />,
      disabled: isPublishing || !used.length,
      onClick: () => (user?.userId ? setIsConfirmOpen(true) : setIsAuthDialogOpen(true)),
    },
  ];

  return (
    <>
      <ResponsiveBar items={items} onItemClick={setActive} />

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{customDesignId ? "Confirm Update" : "Confirm Create"}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-base text-center my-3">
            {customDesignId
              ? "Apply the latest changes to your existing portfolio design?"
              : "Confirm creating your portfolio with the current sections. You can edit them later."}
          </DialogDescription>
          <DialogFooter>
            <Button variant={"outline"} onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setIsConfirmOpen(false);
                await publicPortfolio();
              }}
            >
              {customDesignId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-base text-center my-3">
            You need to sign in before creating a portfolio. Your current work is saved locally.
          </DialogDescription>
          <DialogFooter>
            <Button variant={"outline"} onClick={() => setIsAuthDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsAuthDialogOpen(false);
                const redirect = encodeURIComponent("/studio");
                router.push(`/login?redirect=${redirect}`);
              }}
            >
              Go to Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
