"use client";

import React from "react";
import { ResponsiveBar } from "@/components/layouts/ResponsiveBar";
import { useSidebar } from "@/components/ui-tools/ui/sidebar";
import { Sidebar, Upload } from "lucide-react";
import { useStudio } from "@/context/StudioContext";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui-tools/ui/dialog";
import { createCustomDesign, updatePortfolio, getAllPortfolios, createPortfolio, updatePage } from "@/api/portfolio-endpoints";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui-tools/ui/button";

export default function BottomBar() {
  const { setOpenMobile } = useSidebar();
  const [, setActive] = React.useState<string>("StudioSidebar");
  const { used, portfolioId, selectedPageId } = useStudio();
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
        const createdPortfolio = await createPortfolio({});
        portfolioId = createdPortfolio.id;
      }

      const sectionsPayload = used.map(
        (s) =>
          ({ id: s.id, name: s.name, type: s.type, config: s.config } as {
            id: string;
            name: string;
            type: string;
            config: unknown;
          })
      );
      if (selectedPageId) {
        await updatePage(String(portfolioId), selectedPageId, { sections: sectionsPayload });
      } else {
        // No selected page; currently portfolio has no sections field.
        // We simply ensure the portfolio exists; sections should be managed within pages.
      }

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
      label: portfolioId ? "Update" : "Create",
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
            <DialogTitle>{portfolioId ? "Confirm Update" : "Confirm Create"}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-base text-center my-3">
            {portfolioId
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
              {portfolioId ? "Update" : "Create"}
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
