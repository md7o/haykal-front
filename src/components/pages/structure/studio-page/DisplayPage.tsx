"use client";

import { useStudio } from "@/context/StudioContext";
import { useState, useEffect } from "react";
import { MonitorSmartphone, Redo2, Share, Smartphone, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { sectionsRegistry } from "@/components/pages/sections-design/registry/sections-registry";
import { createCustomDesign, updatePortfolio, getCustomDesignById } from "@/api/portfolio-endpoints";
import PortfolioTheme from "@/components/theme/PortfolioTheme";
import { createPortfolio, getAllPortfolios } from "@/api/portfolio-endpoints";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Reuse the same DOM asset application logic used elsewhere
function applyAssetsToDom(assets: any) {
  if (typeof window === "undefined" || !assets) return;
  try {
    const root = document.documentElement.style;
    const palette = assets.palette || {};
    const font = assets.font;
    const primary = (palette.primary || "").trim();
    const secondary = (palette.secondary || "").trim();
    if (primary) root.setProperty("--portfolio-accent-cus", primary);
    if (secondary) {
      root.setProperty("--portfolio-card-bg-cus", secondary);
      root.setProperty("--portfolio-secondary-card-cus", secondary);
      // if (!root.getPropertyValue("--portfolio-background-cus")) root.setProperty("--portfolio-background-cus", secondary);
    }
    if (font) {
      document.documentElement.style.setProperty("--font-montserrat-cus", font);
      document.body.style.setProperty("--font-montserrat-cus", font);
    }
  } catch {
    /* ignore */
  }
}

export default function DisplayPage() {
  const {
    used,
    selectedSectionId,
    customDesignId,
    portfolioId: ctxPortfolioId,
    setPortfolioId,
    setCustomDesignId,
    slug,
    setSlug,
    assets,
    setAssets,
  } = useStudio();
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSlugDialogOpen, setIsSlugDialogOpen] = useState(false);
  const [slugInput, setSlugInput] = useState("");
  const [slugError, setSlugError] = useState<string | null>(null);
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

  // Apply assets locally (context -> backend fallback)
  // This ensures user sees theme based on network data when needed.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // 1. Context assets
      if (assets) {
        applyAssetsToDom(assets);
        return;
      }
      // 2. Backend persisted design (only if we have an id and nothing else)
      if (customDesignId) {
        try {
          const data = await getCustomDesignById(customDesignId);
          if (!cancelled && data?.assets) {
            setAssets(data.assets);
            applyAssetsToDom(data.assets);
          }
        } catch {
          // ignore backend errors here; not critical for editing UI
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [assets, customDesignId, setAssets]);

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
      // Resolve portfolio from network only (context id or create/fetch)
      let portfolioId = ctxPortfolioId;
      if (!portfolioId) {
        // try to reuse an existing portfolio for this user
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
        // persist through context
        try {
          setPortfolioId(portfolioId);
        } catch {}
      }

      // If user provided a slug, attempt to update it on the portfolio
      const trimmedSlug = slugInput.trim();
      if (trimmedSlug) {
        try {
          // basic sanitize: lowercase and keep [a-z0-9-]
          const sanitized = trimmedSlug
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$|_/g, "");
          if (sanitized) {
            await updatePortfolio(String(portfolioId), { slug: sanitized });
            try {
              setSlug(sanitized);
            } catch {}
          }
        } catch {
          // ignore slug update failure
        }
      }

      const sectionsPayload = used.map((s) => ({ type: s.type, config: s.config } as { type: string; config: unknown }));
      const existingId = customDesignId;
      if (existingId) {
        await updatePortfolio(existingId, { sections: sectionsPayload });
        try {
          setCustomDesignId(existingId);
        } catch {}
      } else {
        const created = await createCustomDesign({ portfolioId: String(portfolioId), sections: sectionsPayload });
        if (created?.id) {
          try {
            setCustomDesignId(String(created.id));
          } catch {}
        }
      }

      router.push("/dashboard/sections");
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
            <Button size="icon" variant="grayFill" onClick={() => router.push("/dashboard/sections")}>
              <Undo2 className="inline w-4 h-4 mr-1" />
            </Button>
            <Button size="icon" variant="grayFill" onClick={() => router.push("/dashboard/sections")}>
              <Redo2 className="inline w-4 h-4 mr-1" />
            </Button>

            <Button
              onClick={() => (user?.userId ? setIsSlugDialogOpen(true) : setIsAuthDialogOpen(true))}
              disabled={isPublishing || !used.length}
            >
              <Share className="inline w-4 h-4 mr-1" />
              {isPublishing ? (customDesignId ? "Updating..." : "Creating...") : customDesignId ? "Update" : "Create"}
            </Button>

            {/* Slug Dialog */}
            <Dialog open={isSlugDialogOpen} onOpenChange={setIsSlugDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Choose your portfolio URL</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Add a unique slug to personalize your portfolio link. You can change it later.
                </DialogDescription>
                <div className="mt-3 space-y-2">
                  <Input
                    value={slugInput}
                    onChange={(e) => {
                      setSlugError(null);
                      setSlugInput(e.target.value);
                    }}
                    placeholder="your-name"
                  />
                  {slugError && <div className="text-xs text-red-600">{slugError}</div>}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSlugDialogOpen(false)}>
                    Skip
                  </Button>
                  <Button
                    onClick={() => {
                      // Optional simple validation
                      const v = slugInput.trim();
                      if (v && v.length < 3) {
                        setSlugError("Slug must be at least 3 characters or leave it empty.");
                        return;
                      }
                      setIsSlugDialogOpen(false);
                      setIsConfirmOpen(true);
                    }}
                  >
                    Continue
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{customDesignId ? "Confirm Update" : "Confirm Create"}</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  {customDesignId
                    ? "Apply the latest changes to your existing portfolio design?"
                    : "Confirm creating your portfolio with the current sections. You can edit them later."}
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
      <PortfolioTheme
        assets={assets || undefined}
        className={`${
          view === "mobile" ? "xl:w-[26rem] w-full mx-auto" : "w-full mx-auto"
        } flex-1  rounded-2xl transition-all duration-800`}
      >
        <div>
          {/* Fixed header at top of portfolio preview if present and explicitly active */}
          {(() => {
            const headerDef = sectionsRegistry["header"];
            if (!headerDef) return null;
            const headerInst = used.find((s) => s.type === "header");
            if (!headerInst) return null;
            const cfg = headerInst.config as any;
            const isActive = cfg?.active !== false; // treat missing as active
            if (!isActive) return null;
            return (
              <div className="mb-2">
                <headerDef.Design config={cfg} view={view} />
              </div>
            );
          })()}
          {used.filter((s) => s.type !== "header").length === 0 && (
            <div className="text-sm text-description text-center py-10">Add sections from the sidebar to preview them.</div>
          )}
          <div className={`mx-auto ${view === "desktop" ? "w-full" : "xl:w-[25rem] w-full"} transition-all duration-300`}>
            {used
              .filter((sec) => sec.type !== "header")
              .map((sec) => {
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
                    className={`my-28 first:mt-10 last:mb-10 rounded-xl  ${
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
      </PortfolioTheme>
    </div>
  );
}
