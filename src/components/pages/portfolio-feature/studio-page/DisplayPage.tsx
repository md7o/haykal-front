"use client";

import { useStudio } from "@/context/StudioContext";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MonitorSmartphone, Share, Smartphone, Edit3, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui-tools/ui/button";
import { Input } from "@/components/ui-tools/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui-tools/ui/dialog";
import DialogStorage from "@/components/ui-tools/custom_ui/DialogStorage";
import { sectionsRegistry } from "@/components/pages/portfolio-feature/sections-design/registry/sections-registry";
import { updatePortfolio, getCustomDesignById, updatePage, createPage, getPages } from "@/api/portfolio-endpoints";
import PortfolioTheme from "@/components/theme/PortfolioTheme";
import { createPortfolio } from "@/api/portfolio-endpoints";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import DrawerEditor from "./DrawerEditor";
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import {
  getDraftsMap as getDraftsMapCentral,
  setDraftsMap as setDraftsMapCentral,
  getAssetsDraft as getAssetsDraftCentral,
  setAssetsDraft as setAssetsDraftCentral,
} from "@/lib/studio-storage";

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
    portfolioId: ctxPortfolioId,
    setPortfolioId,
    setSlug,
    assets,
    setAssets,
    selectSection,
    reorderUsed,
    removeSection,
    selectedPageId,
  } = useStudio();
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSlugDialogOpen, setIsSlugDialogOpen] = useState(false);
  const [slugInput, setSlugInput] = useState("");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const isEditMode = search?.get("mode") === "edit";
  const [headerRemotePages, setHeaderRemotePages] = useState<
    Array<{ id: string; title: string; slug?: string | null; order?: number }>
  >([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const usedNonHeader = useMemo(() => used.filter((s) => s.type !== "header"), [used]);
  const usedIds = useMemo(() => usedNonHeader.map((s) => s.id), [usedNonHeader]);

  const onDragEnd = useCallback(
    (evt: DragEndEvent) => {
      const { active, over } = evt;
      if (!over || active.id === over.id) return;
      const oldIndex = used.findIndex((s) => s.id === active.id);
      const newIndex = used.findIndex((s) => s.id === over.id);
      if (oldIndex >= 0 && newIndex >= 0) reorderUsed(oldIndex, newIndex);
    },
    [used, reorderUsed]
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width:1200px)");
    const handleMediaChange = (e: MediaQueryListEvent) => setView(e.matches ? "desktop" : "mobile");
    // set initial view
    setView(mq.matches ? "desktop" : "mobile");

    // Register listener using the proper API for the current browser
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handleMediaChange as EventListener);
    } else if (typeof mq.addListener === "function") {
      // older API takes the listener directly
      // @ts-ignore - legacy API
      mq.addListener(handleMediaChange);
    }

    return () => {
      if (typeof mq.removeEventListener === "function") {
        mq.removeEventListener("change", handleMediaChange as EventListener);
      } else if (typeof mq.removeListener === "function") {
        // @ts-ignore - legacy API
        mq.removeListener(handleMediaChange);
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (assets) return applyAssetsToDom(assets);
      if (!ctxPortfolioId) return;
      try {
        const data = await getCustomDesignById(ctxPortfolioId);
        if (mounted && data?.assets) {
          setAssets(data.assets);
          applyAssetsToDom(data.assets);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      mounted = false;
    };
  }, [assets, ctxPortfolioId, setAssets]);

  // Load remote pages to show in header navigation along with drafts
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!ctxPortfolioId) {
        setHeaderRemotePages([]);
        return;
      }
      try {
        const remote = await getPages(String(ctxPortfolioId));
        if (!alive) return;
        const mapped = (remote || []).map((p) => ({ id: p.id, title: p.title, slug: p.slug, order: p.order }));
        setHeaderRemotePages(mapped);
      } catch {
        if (alive) setHeaderRemotePages([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [ctxPortfolioId]);

  // --- Drafts helpers (accept map or legacy array) ---
  const readDraftMap = useCallback((): Record<
    string,
    { id: string; title?: string; slug?: string | null; sections?: unknown; order?: number; portfolioId?: string | null }
  > => {
    try {
      const map = getDraftsMapCentral();
      // ensure portfolioId field for drafts
      const withPid: Record<string, any> = {};
      for (const [k, v] of Object.entries(map || {})) {
        withPid[k] = {
          id: String((v as any).id),
          title: (v as any).title ?? "New Page",
          slug: (v as any).slug ?? "",
          sections: (v as any).sections ?? null,
          order: (v as any).order,
          portfolioId: (v as any).portfolioId ?? (ctxPortfolioId ? String(ctxPortfolioId) : "draft"),
        };
      }
      return withPid;
    } catch {
      return {};
    }
  }, [ctxPortfolioId]);

  const writeDraftMap = useCallback((map: Record<string, any>) => {
    try {
      setDraftsMapCentral(map);
    } catch {
      /* ignore */
    }
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
      // Pre-sanitize slug if provided
      const rawSlug = slugInput.trim();
      const sanitizedSlug = rawSlug
        ? rawSlug
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$|_/g, "")
        : undefined;
      // ensure we have or create a portfolio id for the user (include slug at creation to avoid extra patch)
      const resolvePortfolioId = async () => {
        if (ctxPortfolioId) return ctxPortfolioId;
        const created = await createPortfolio({ slug: sanitizedSlug });
        return created.id;
      };

      const portfolioId = await resolvePortfolioId();
      try {
        setPortfolioId(portfolioId);
      } catch {}

      // If we already sent slug during creation, skip updating it again
      if (!ctxPortfolioId && sanitizedSlug) {
        try {
          setSlug(sanitizedSlug);
        } catch {}
      } else if (sanitizedSlug) {
        try {
          await updatePortfolio(String(portfolioId), { slug: sanitizedSlug });
          try {
            setSlug(sanitizedSlug);
          } catch {}
        } catch {}
      }

      // Build sections payload including ids and names to preserve identity server-side
      const sectionsPayload = used.map((s) => ({ id: s.id, name: s.name, type: s.type, config: s.config }));
      // Build assets payload (if any)
      let assetsPayload: Record<string, any> | undefined = (assets as any) ?? (getAssetsDraftCentral() as any) ?? undefined;

      // Read all local drafts (map or legacy array) and filter drafts only
      const fullDraftMap = readDraftMap();
      const draftEntries = Object.values(fullDraftMap || {}).filter((d: any) => String(d?.portfolioId ?? "draft") === "draft");

      // Fetch existing pages once
      const existingPages = await getPages(String(portfolioId));

      const findExistingMatch = (d: any) => {
        const dSlug = String(d?.slug ?? "").trim();
        const dTitle = String(d?.title ?? "").trim();
        if (dSlug) {
          const slugLow = dSlug.toLowerCase();
          const found = existingPages.find((p) => (p.slug || "").toLowerCase() === slugLow);
          if (found) return found;
        }
        if (dTitle) {
          const found = existingPages.find((p) => p.title.trim().toLowerCase() === dTitle.toLowerCase());
          if (found) return found;
        }
        // Special case: Home
        if (dSlug.toLowerCase() === "home" || dTitle === "Home") {
          const existingHome = existingPages.find((p) => (p.slug || "").toLowerCase() === "home" || p.title === "Home");
          if (existingHome) return existingHome;
        }
        return null;
      };

      // Create/update all draft pages first
      for (const d of draftEntries) {
        const sectionsForPage = Array.isArray(d?.sections)
          ? d.sections
          : // fall back to current editor sections if this draft is the selected one
          selectedPageId && fullDraftMap[selectedPageId]?.id === d?.id
          ? sectionsPayload
          : [];
        const order = typeof d?.order === "number" ? d.order : existingPages.length;
        const title = d?.title ?? "New Page";
        const slug = (d?.slug ?? "") || undefined;
        const match = findExistingMatch(d);
        if (match) {
          await updatePage(String(portfolioId), match.id, {
            title: title,
            slug: slug,
            sections: sectionsForPage,
            order,
          });
        } else {
          await createPage(String(portfolioId), {
            title: title,
            slug: slug,
            sections: sectionsForPage,
            order,
          });
        }
      }

      // If the selected page is NOT a draft (i.e., an existing server page), update its sections from editor
      const isSelectedDraft = (() => {
        try {
          const d = fullDraftMap[selectedPageId as string];
          return !!d && String(d.portfolioId ?? "draft") === "draft";
        } catch {
          return false;
        }
      })();
      if (selectedPageId && !isSelectedDraft) {
        await updatePage(String(portfolioId), selectedPageId, { sections: sectionsPayload });
      }

      // If nothing was selected and there were no drafts, ensure Home exists with current sections
      if (!selectedPageId && draftEntries.length === 0) {
        const existingHome = existingPages.find((p) => (p.slug || "").toLowerCase() === "home" || p.title === "Home");
        if (existingHome) {
          await updatePage(String(portfolioId), existingHome.id, { sections: sectionsPayload });
        } else {
          await createPage(String(portfolioId), { title: "Home", slug: "home", sections: sectionsPayload, order: 0 });
        }
      }

      // Update assets on the portfolio if available
      if (assetsPayload) {
        await updatePortfolio(String(portfolioId), { assets: assetsPayload });
      }

      // Clear local drafts now that everything is persisted
      try {
        setDraftsMapCentral({});
      } catch {
        /* ignore */
      }

      router.push("/dashboard/sections");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPublishError(msg || "Failed to create portfolio");
    } finally {
      setIsPublishing(false);
    }
  };

  // Autosave current page sections to local drafts (per page), minimal and guarded
  useEffect(() => {
    if (!selectedPageId) return;
    try {
      const map = readDraftMap();
      const prev = map[selectedPageId] || { id: selectedPageId };
      const nextSections = used.map((s) => ({ id: s.id, name: s.name, type: s.type, config: s.config }));
      const prevSections = Array.isArray(prev.sections) ? prev.sections : [];
      const same = JSON.stringify(prevSections) === JSON.stringify(nextSections);
      if (same) return;
      const isHome = selectedPageId === "home";
      map[selectedPageId] = {
        id: selectedPageId,
        title: prev.title ?? (isHome ? "Home" : "New Page"),
        slug: prev.slug ?? (isHome ? "home" : ""),
        order: typeof prev.order === "number" ? prev.order : prev.id === "home" ? 0 : 99,
        portfolioId: prev.portfolioId ?? (ctxPortfolioId ? String(ctxPortfolioId) : "draft"),
        sections: nextSections,
      };
      writeDraftMap(map);
    } catch {
      /* ignore */
    }
  }, [selectedPageId, used, ctxPortfolioId, readDraftMap, writeDraftMap]);

  return (
    <div className="h-full min-h-0 flex flex-col gap-4 xl:p-5 p-2 bg-card-bg">
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
              onClick={() => {
                if (!user?.userId) return setIsAuthDialogOpen(true);
                // Always open confirm first; slug will be requested after confirm when creating
                setIsConfirmOpen(true);
              }}
              disabled={isPublishing || !used.length}
            >
              <Share className="inline w-4 h-4 mr-1" />
              {isPublishing
                ? isEditMode || ctxPortfolioId
                  ? "Updating..."
                  : "Creating..."
                : isEditMode || ctxPortfolioId
                ? "Update"
                : "Create"}
            </Button>

            <DialogStorage
              open={isConfirmOpen}
              onOpenChange={setIsConfirmOpen}
              title={isEditMode || ctxPortfolioId ? "Confirm Update" : "Confirm Create"}
              content={
                isEditMode || ctxPortfolioId
                  ? "Apply the latest changes to your existing portfolio design?"
                  : "Confirm creating your portfolio with the current sections. You can edit them later."
              }
              confirmLabel={isEditMode || ctxPortfolioId ? "Update" : "Create"}
              cancelLabel="Cancel"
              onConfirm={async () => {
                setIsConfirmOpen(false);
                // If editing or already have a portfolio id, publish immediately.
                if (isEditMode || ctxPortfolioId) {
                  await publicPortfolio();
                } else {
                  // Otherwise, ask for slug next.
                  setIsSlugDialogOpen(true);
                }
              }}
              onCancel={() => setIsConfirmOpen(false)}
            />
            {/* Slug Dialog */}
            <DialogStorage
              open={isSlugDialogOpen}
              onOpenChange={setIsSlugDialogOpen}
              title="Choose your portfolio URL"
              content="Add a unique slug to personalize your portfolio link. You can change it later."
              showInput
              initialValue={slugInput}
              confirmLabel="Continue"
              cancelLabel="Skip"
              onConfirm={async () => {
                const v = slugInput.trim();
                if (v && v.length < 3) {
                  setSlugError("Slug must be at least 3 characters or leave it empty.");
                  return;
                }
                setIsSlugDialogOpen(false);
                await publicPortfolio();
              }}
              onCancel={() => setIsSlugDialogOpen(false)}
            />
            <DialogStorage
              open={isAuthDialogOpen}
              onOpenChange={setIsAuthDialogOpen}
              title="Sign In Required"
              content="You need to sign in before creating a portfolio. Your current work is saved locally."
              confirmLabel="Go to Sign In"
              cancelLabel="Cancel"
              onConfirm={() => {
                setIsAuthDialogOpen(false);
                const redirect = encodeURIComponent("/studio");
                router.push(`/login?redirect=${redirect}`);
              }}
              onCancel={() => setIsAuthDialogOpen(false)}
            />
          </>
        </div>
      </div>

      <PortfolioTheme
        assets={assets || undefined}
        className={`flex-1 min-h-0  ${
          view === "mobile" ? "xl:w-[26rem] w-full mx-auto" : "w-full mx-auto"
        } rounded-soft transition-all duration-800`}
      >
        <div className="h-full flex flex-col min-h-0 ">
          {/* Fixed header at top of portfolio preview if present and explicitly active */}
          {(() => {
            const headerDef = sectionsRegistry["header"];
            if (!headerDef) return null;
            const headerInst = used.find((s) => s.type === "header");
            if (!headerInst) return null;
            const cfg = { ...(headerInst.config as any) };
            const isActive = cfg?.active !== false;
            if (!isActive) return null;
            // Build pages list for header nav: merge server pages with local drafts (map-aware)
            let pagesForHeader: Array<{ id: string; title: string; slug?: string | null; order?: number }> = [];
            try {
              const map = readDraftMap();
              pagesForHeader = Object.values(map).map((p: any) => ({
                id: String(p.id),
                title: p.title || "New Page",
                slug: p.slug ?? "",
                order: p.order,
              }));
            } catch {
              /* ignore */
            }
            // Merge remote + drafts. Dedupe by slug (case-insensitive) then title, preferring remote entries when duplicates exist
            const byKey = new Map<string, { id: string; title: string; slug?: string | null; order?: number }>();
            const keyOf = (p: { id: string; title: string; slug?: string | null }) => {
              const s = (p.slug || "").trim().toLowerCase();
              if (s) return `s:${s}`;
              return `t:${(p.title || "").trim().toLowerCase()}`;
            };
            // Insert remote first so they win on conflicts
            for (const p of headerRemotePages) byKey.set(keyOf(p), p);
            // Insert drafts only if not already present
            for (const p of pagesForHeader) {
              const k = keyOf(p);
              if (!byKey.has(k)) byKey.set(k, p);
            }
            const mergedList = Array.from(byKey.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            // Ensure unique ids to avoid React key collisions
            const seenIds = new Set<string>();
            const uniqueById = mergedList.filter((p) => {
              const id = String(p.id);
              if (seenIds.has(id)) return false;
              seenIds.add(id);
              return true;
            });
            const cfgWithPages = { ...cfg, pages: uniqueById };
            return (
              <div className="">
                <headerDef.Design config={cfgWithPages} view={view} />
              </div>
            );
          })()}
          {used.filter((s) => s.type !== "header").length === 0 && (
            <div className="text-sm text-description text-center py-10">Add sections from the sidebar to preview them.</div>
          )}
          <div
            className={`flex-1 overflow-auto mx-auto first:mt-10 last:mb-10  ${
              view === "desktop" ? "w-full" : "xl:w-[26rem] w-full"
            } transition-all duration-300`}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={onDragEnd}
            >
              <SortableContext items={usedIds} strategy={verticalListSortingStrategy}>
                {usedNonHeader.map((sec) => {
                  const def = sectionsRegistry[sec.type];
                  if (!def) {
                    return (
                      <div key={sec.id} className="border mb-4 rounded p-4 bg-red-50 text-sm text-red-600">
                        Unknown section type: {sec.type}
                      </div>
                    );
                  }
                  return (
                    <DraggableSection
                      key={sec.id}
                      id={sec.id}
                      view={view}
                      isSelected={sec.id === selectedSectionId}
                      onSelect={() => selectSection(sec.id === selectedSectionId ? null : sec.id)}
                      onEdit={() => {
                        selectSection(sec.id);
                        setDrawerOpen(true);
                      }}
                      onRemove={() => removeSection(sec.id)}
                    >
                      <def.Design config={sec.config} view={view} />
                    </DraggableSection>
                  );
                })}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </PortfolioTheme>
      <DrawerEditor open={drawerOpen} setOpen={setDrawerOpen} />
    </div>
  );
}

// --- Local draggable section wrapper used in preview list ---
function DraggableSection({
  id,
  view,
  isSelected,
  onSelect,
  onEdit,
  onRemove,
  children,
}: {
  id: string;
  view: "desktop" | "mobile";
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    ...(isDragging ? { opacity: 0.85, zIndex: 40 } : {}),
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      // my-28 first:mt-10 last:mb-10
      className={`relative   ${
        isSelected
          ? "border-2 border-dashed  py-3 border-accent/60 shadow-sm"
          : "border-2 border-card-border/20 border-dashed py-3  hover:border-accent/30 hover:border-dashed transition-colors"
      } ${isDragging ? "cursor-grabbing" : ""}`}
    >
      {/* Action buttons (only when selected) */}
      {isSelected && (
        <div
          className={`absolute top-1 left-1 z-50 flex items-center gap-2 bg-black/10 backdrop-blur px-1.5 py-1 rounded-soft shadow-md`}
        >
          <button
            className="p-1.5 rounded hover:bg-black/10 cursor-pointer"
            aria-label="Edit section"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit3 className="w-4 h-4 text-description" />
          </button>
          <button
            className={`p-1.5 rounded cursor-grab hover:bg-black/10 ${isDragging ? "cursor-grabbing" : ""}`}
            {...attributes}
            {...listeners}
            aria-label="Drag section"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4 text-description" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-black/10 cursor-pointer"
            aria-label="Edit section"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 className="w-4 h-4 text-description" />
          </button>
        </div>
      )}
      <div className="rounded-soft overflow-hidden">{children}</div>
    </div>
  );
}
