"use client";

import React from "react";
import { ResponsiveBar } from "@/components/layouts/ResponsiveBar";
import { useSidebar } from "@/components/ui/sidebar";
import { Sidebar, Upload } from "lucide-react";
import { useStudio } from "@/context/StudioContext";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { createCustomDesign, updateCustomDesign } from "@/api/studio-endpoints";
import { createPortfolio, Category } from "@/api/portfolio-endpoints";
import { useAuth } from "@/context/AuthContext";
import { useStructureContext } from "@/context/StructureContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function BottomBar() {
  const { setOpenMobile } = useSidebar();
  const [, setActive] = React.useState<string>("StudioSidebar");
  const { used } = useStudio();
  const { selectedCategory, selectedLayout } = useStructureContext();
  const [isPublishing, setIsPublishing] = useState(false);
  const [, setPublishError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const publicPortfolio = async () => {
    if (!used.length) return;
    setIsPublishing(true);
    setPublishError(null);
    try {
      let portfolioId = typeof window !== "undefined" ? sessionStorage.getItem("portfolioId") : null;
      if (!portfolioId) {
        if (!selectedCategory || !selectedLayout) throw new Error("Missing category or layout selection to create a portfolio.");
        const layoutStr = typeof selectedLayout === "string" ? selectedLayout : String(selectedLayout ?? "");
        const normalizedLayout: "Landingpage" | "Sections" =
          layoutStr === "Landing Page type" || layoutStr === "Landingpage" ? "Landingpage" : "Sections";
        if (!user?.userId) throw new Error("User must be logged in to publish a portfolio.");

        const createdPortfolio = await createPortfolio({
          userId: user.userId,
          category_type: selectedCategory as Category,
          layout_type: normalizedLayout,
        });
        portfolioId = createdPortfolio.id;
        if (typeof window !== "undefined") sessionStorage.setItem("portfolioId", portfolioId);
      }

      const sectionsPayload = used.map((s) => ({ type: s.type, config: s.config } as { type: string; config: unknown }));
      const existingId = typeof window !== "undefined" ? sessionStorage.getItem("customDesignId") : null;
      if (existingId) {
        await updateCustomDesign(existingId, { sections: sectionsPayload });
      } else {
        const created = await createCustomDesign({ portfolioId, sections: sectionsPayload });
        if (created?.id && typeof window !== "undefined") {
          sessionStorage.setItem("customDesignId", String(created.id));
        }
      }

      router.push("/own");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPublishError(msg || "Failed to publish portfolio");
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
      id: "publish",
      label: "Publish",
      icon: <Upload size={25} />,
      disabled: isPublishing || !used.length,
      onClick: () => setIsConfirmOpen(true),
    },
  ];

  return (
    <>
      <ResponsiveBar items={items} onItemClick={setActive} />

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Publish</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-base text-center my-3">
            Are you sure you want to publish your portfolio? This action will make it public.
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
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
