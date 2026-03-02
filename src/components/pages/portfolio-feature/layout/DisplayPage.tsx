"use client";

import { usePages } from "@/lib/context/PagesContext";
import { useSection } from "@/lib/context/SectionContext";
import { useUserPortfolio } from "@/lib/context/UserPortfolioContext";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Cloud, MonitorSmartphone, Smartphone, Check } from "lucide-react";
import { Button } from "@/components/ui/shadcn_ui/button";
import DialogStorage from "@/components/ui/custom_ui/DialogStorage";
import { sectionsVisualization } from "@/components/pages/portfolio-feature/sections-design/sectionsVisualization";
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useViewMode } from "@/hooks/useViewMode";
import { usePublish } from "@/hooks/usePublish";
import { DraggableSection } from "./components/DraggableSection";
import ShareButton from "@/components/ui/custom_ui/ShareButton";
import { Spinner } from "@/components/ui/shadcn_ui/spinner";
import { usePortfolio } from "@/lib/context/PortfolioContext";
import DrawerEditor from "./DrawerEditor";
import { toast, Toaster } from "sonner";

export default function DisplayPage() {
  const { portfolioId, slug, asset } = usePortfolio();

  const { pages, selectedPageId, setSelectedPageId } = usePages();

  const {
    sections,
    selectedSectionId,
    setSelectedSectionId,
    reorderSections,
    removeSection,
    isSectionsLoading,
    syncError,
    savePendingChanges,
    hasPendingChanges,
    lastSavedAt,
  } = useSection();

  const { refreshPortfolioData } = useUserPortfolio();
  const isPublished = false; // TODO: Implement publish status tracking

  const [view, setView] = useViewMode();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    publishError,
    isConfirmOpen,
    isSlugDialogOpen,
    isAuthDialogOpen,
    setIsConfirmOpen,
    setIsSlugDialogOpen,
    setIsAuthDialogOpen,
    handleConfirmPublish,
    confirmPublish,
    goToSignIn,
  } = usePublish(portfolioId, selectedPageId, sections, refreshPortfolioData);

  useEffect(() => {
    refreshPortfolioData();
  }, []);

  useEffect(() => {
    if (!hasPendingChanges || isSectionsLoading) {
      clearInterval(autoSaveIntervalRef.current as any);
      autoSaveIntervalRef.current = null;
      return;
    }

    if (!autoSaveIntervalRef.current) {
      autoSaveIntervalRef.current = setInterval(async () => {
        try {
          await savePendingChanges();
          setShowSavedIndicator(true);
          setTimeout(() => setShowSavedIndicator(false), 2000);
        } catch (err) {
          console.error("[DisplayPage] Auto-save failed:", err);
        }
      }, 3000);
    }

    return () => {
      clearInterval(autoSaveIntervalRef.current as any);
      autoSaveIntervalRef.current = null;
    };
  }, [hasPendingChanges, isSectionsLoading, savePendingChanges]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const sectionsNonHeader = useMemo(() => sections.filter((s) => s.type !== "header"), [sections]);
  const sectionIds = useMemo(() => sectionsNonHeader.map((s) => s.id), [sectionsNonHeader]);

  const onDragEnd = useCallback(
    (evt: DragEndEvent) => {
      const { active, over } = evt;
      if (!over || active.id === over.id) return;
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      if (oldIndex >= 0 && newIndex >= 0) reorderSections(oldIndex, newIndex);
    },
    [sections, reorderSections],
  );

  // When a section is selected from the sidebar, ensure it's visible by scrolling the display container.
  useEffect(() => {
    if (!selectedSectionId || !scrollContainerRef.current) return;

    requestAnimationFrame(() => {
      const el = scrollContainerRef.current?.querySelector(`[data-section-id="${selectedSectionId}"]`) as HTMLElement | null;
      if (!el) return;
      try {
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      } catch {
        const container = scrollContainerRef.current!;
        const { top: containerTop, bottom: containerBottom } = container.getBoundingClientRect();
        const { top: elTop, bottom: elBottom } = el.getBoundingClientRect();
        if (elTop < containerTop || elBottom > containerBottom) {
          const offset = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
          container.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
        }
      }
    });
  }, [selectedSectionId]);

  const handleSaveShortcut = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!isSectionsLoading && hasPendingChanges) {
          toast.success("Changes saved!");
          savePendingChanges();
        }
      }
    },
    [isSectionsLoading, hasPendingChanges, savePendingChanges],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleSaveShortcut);
    return () => {
      window.removeEventListener("keydown", handleSaveShortcut);
    };
  }, [handleSaveShortcut]);

  return (
    <div className="h-full min-h-0 flex flex-col gap-4 xl:p-5 p-2 bg-card-bg">
      <Toaster
        toastOptions={{
          style: { background: "var(--color-card-bg)", border: "var(--color-border)", color: "var(--color-title)" },
        }}
      />

      {/* AppBar */}
      <div className="hidden xl:flex justify-between items-center">
        <div className="space-x-2">
          <Button variant={view === "desktop" ? "fill" : "grayFill"} onClick={() => setView("desktop")}>
            <MonitorSmartphone className="inline w-4 h-4 mr-1" /> Desktop
          </Button>
          <Button variant={view === "mobile" ? "fill" : "grayFill"} onClick={() => setView("mobile")}>
            <Smartphone className="inline w-4 h-4 mr-1" /> Mobile
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {(publishError || syncError) && <div className="text-sm text-red-600">{publishError || syncError}</div>}

          <div className="text-sm text-gray-500">
            {isSectionsLoading || hasPendingChanges ? (
              showSavedIndicator ? (
                <div className="flex items-center gap-1 text-description">
                  <Check className="size-4" />
                  Saved
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Spinner className="size-4" />
                  Saving...
                </div>
              )
            ) : lastSavedAt ? (
              <span>All changes saved</span>
            ) : null}
          </div>

          <Button variant={"outline"} onClick={savePendingChanges} disabled={isSectionsLoading || !hasPendingChanges}>
            {isSectionsLoading ? (
              <div className="flex justify-center items-center gap-2">
                <Spinner className="mx-auto text-white size-5" />
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex justify-center items-center gap-2 ">
                {" "}
                <Cloud />
                <span>Save</span>
              </div>
            )}
          </Button>
          <ShareButton portfolioId={portfolioId ?? undefined} />

          <DialogStorage
            open={isConfirmOpen}
            onOpenChange={setIsConfirmOpen}
            title={isPublished ? "Update Portfolio" : "Publish Portfolio"}
            content={isPublished ? "Update your portfolio with the latest changes?" : "Are you ready to publish your portfolio?"}
            confirmLabel={isPublished ? "Update" : "Confirm"}
            cancelLabel="Cancel"
            onConfirm={async () => {
              if (isPublished) {
                await confirmPublish();
              } else {
                handleConfirmPublish();
              }
            }}
            onCancel={() => setIsConfirmOpen(false)}
          />

          {!isPublished && (
            <DialogStorage
              open={isSlugDialogOpen}
              onOpenChange={setIsSlugDialogOpen}
              title="Set Your Portfolio URL"
              content="Choose a unique slug for your portfolio URL."
              showInput={true}
              initialValue={slug || ""}
              confirmLabel="Publish"
              cancelLabel="Cancel"
              onConfirm={async (val) => {
                setIsSlugDialogOpen(false);
                await confirmPublish(val);
              }}
              onCancel={() => setIsSlugDialogOpen(false)}
            />
          )}

          <DialogStorage
            open={isAuthDialogOpen}
            onOpenChange={setIsAuthDialogOpen}
            title="Sign In Required"
            content="You need to sign in before publishing a portfolio."
            confirmLabel="Go to Sign In"
            cancelLabel="Cancel"
            onConfirm={goToSignIn}
            onCancel={() => setIsAuthDialogOpen(false)}
          />
        </div>
      </div>

      <div
        className={`flex-1 min-h-0  ${
          view === "mobile" ? "xl:w-[26rem] w-full mx-auto" : "w-full mx-auto"
        } rounded-soft transition-all duration-300 bg-portf-background`}
      >
        <div className="h-full flex flex-col min-h-0 ">
          {/* Header */}
          {(() => {
            const headerDef = sectionsVisualization["header"];
            if (!headerDef) return null;

            const headerInst = sections.find((s) => s.type === "header");
            const cfg = {
              ...(headerDef.defaultConfig as any),
              ...(headerInst?.config as any),
              portfolioId,
              pages: pages.map((p) => ({ id: p.id, title: p.slug, slug: p.slug })),
            };
            if (cfg?.active === false) return null;

            return (
              <div
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  const link = target.closest("a");
                  if (!link) return;
                  const href = link.getAttribute("href");
                  if (!href?.startsWith("?page=")) return;
                  e.preventDefault();
                  const pageId = href.split("=")[1];
                  if (pageId) setSelectedPageId(pageId);
                }}
              >
                <headerDef.Design config={cfg} view={view} isPreview={true} asset={asset} />
              </div>
            );
          })()}
          {sections.filter((s) => s.type !== "header").length === 0 && (
            <div className="text-sm text-description text-center py-10">Add sections from the sidebar to preview them.</div>
          )}

          <div
            ref={scrollContainerRef}
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
              <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
                {sectionsNonHeader.map((sec) => {
                  const def = sectionsVisualization[sec.type];
                  if (!def) {
                    return (
                      <div key={sec.id} className="border mb-4 rounded p-4 bg-red-50 text-sm text-red-600">
                        Unknown section type: {sec.type}
                      </div>
                    );
                  }
                  // Merge section config with default config to ensure all required fields exist
                  const mergedConfig = { ...(def.defaultConfig as Record<string, unknown>), ...(sec.config || {}) };
                  return (
                    <DraggableSection
                      key={sec.id}
                      id={sec.id}
                      isSelected={sec.id === selectedSectionId}
                      onSelect={() => setSelectedSectionId(sec.id === selectedSectionId ? null : sec.id)}
                      onEdit={() => {
                        setSelectedSectionId(sec.id);
                        setDrawerOpen(true);
                      }}
                      onRemove={() => removeSection(sec.id)}
                    >
                      <def.Design config={mergedConfig} view={view} asset={asset} />
                    </DraggableSection>
                  );
                })}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
      <DrawerEditor open={drawerOpen} setOpen={setDrawerOpen} />
    </div>
  );
}
