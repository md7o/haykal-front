"use client";

import { useStudio } from "@/context/StudioContext";
import { useState, useEffect } from "react";
import { MonitorSmartphone, Share, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { sectionsRegistry } from "@/components/pages/sections-design/registry/sections-registry";
import { createCustomDesign, updateCustomDesign } from "@/api/studio-endpoints";
import { createPortfolio, Category } from "@/api/portfolio-endpoints";
import { useAuth } from "@/context/AuthContext";
import { useStructureContext } from "@/context/StructureContext";
import { useRouter } from "next/navigation";

export default function DisplayPage() {
  const { used, selectedSectionId } = useStudio();
  const { selectedCategory, selectedLayout } = useStructureContext();
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1200px)");

    const handleChange = (e: MediaQueryListEvent) => setView(e.matches ? "desktop" : "mobile");

    // initialize
    setView(mq.matches ? "desktop" : "mobile");

    const mql = mq as MediaQueryList & {
      addListener?: (l: (e: MediaQueryListEvent) => void) => void;
      removeListener?: (l: (e: MediaQueryListEvent) => void) => void;
    };

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handleChange);
    } else if (typeof mql.addListener === "function") {
      mql.addListener(handleChange);
    }

    return () => {
      if (typeof mql.removeEventListener === "function") {
        mql.removeEventListener("change", handleChange);
      } else if (typeof mql.removeListener === "function") {
        mql.removeListener(handleChange);
      }
    };
  }, []);

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
      let portfolioId = typeof window !== "undefined" ? sessionStorage.getItem("portfolioId") : null;
      if (!portfolioId) {
        if (!selectedCategory || !selectedLayout) throw new Error("Missing category or layout selection to create a portfolio.");
        const layoutStr = typeof selectedLayout === "string" ? selectedLayout : String(selectedLayout ?? "");
        const normalizedLayout: "Landingpage" | "Sections" =
          layoutStr === "Landing Page type" || layoutStr === "Landingpage" ? "Landingpage" : "Sections";

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
      setPublishError(msg || "Failed to create portfolio");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className=" h-full flex flex-col gap-4 xl:p-5 p-2 bg-card-bg">
      {/* AppBar */}
      <div className="hidden xl:flex justify-between items-center">
        <div className="space-x-2">
          <Button variant={view === "desktop" ? "fill" : "outline"} onClick={() => setView("desktop")}>
            <MonitorSmartphone className="inline w-4 h-4 mr-1" /> Desktop
          </Button>
          <Button variant={view === "mobile" ? "fill" : "outline"} onClick={() => setView("mobile")}>
            <Smartphone className="inline w-4 h-4 mr-1" /> Mobile
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {publishError && <div className="text-sm text-red-600">{publishError}</div>}
          <>
            <Button
              onClick={() => (user?.userId ? setIsConfirmOpen(true) : setIsAuthDialogOpen(true))}
              disabled={isPublishing || !used.length}
            >
              <Share className="inline w-4 h-4 mr-1" /> {isPublishing ? "Creating..." : "Create"}
            </Button>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Create</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Confirming to create your portfolio with the current sections? you can edit them later.
                </DialogDescription>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      setIsConfirmOpen(false);
                      await publicPortfolio();
                    }}
                    disabled={isPublishing || !used.length}
                  >
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sign In Required</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  You need to sign in before creating a portfolio. Your current work is saved locally.
                </DialogDescription>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAuthDialogOpen(false)}>
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
        </div>
      </div>
      <div
        className={`preview-theme flex-1 py-5 bg-white rounded-2xl ${
          view === "desktop" ? "w-full" : "xl:w-[26rem] w-full"
        } mx-auto transition-all `}
      >
        {!used.length && (
          <div className="text-sm text-description text-center py-10">Add sections from the sidebar to preview them.</div>
        )}
        <div className={`mx-auto ${view === "desktop" ? "w-full" : "xl:w-[25rem] w-full"} transition-all `}>
          {used.map((sec) => {
            const def = sectionsRegistry[sec.type];
            if (!def) {
              return (
                <div key={sec.id} className="border mb-4 rounded p-4 bg-red-50 text-sm text-red-600">
                  Unknown section type: {sec.type}
                </div>
              );
            }
            return (
              <div
                key={sec.id}
                className={`my-28 mt-10 rounded-xl transition-all duration-200 ${
                  sec.id === selectedSectionId
                    ? "border-2 border-dashed mx-5 py-3 border-accent shadow-sm"
                    : "border border-transparent"
                }`}
              >
                <def.Design config={sec.config} view={view} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
