"use client";

import { usePages } from "@/context/PagesContext";
import { useSection } from "@/context/SectionContext";
import { useUserPortfolio } from "@/context/UserPortfolioContext";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Cloud, MonitorSmartphone, Smartphone, Check } from "lucide-react";
import { Button } from "@/components/ui-tools/ui/button";
import DialogStorage from "@/components/ui-tools/custom_ui/DialogStorage";
import { sectionsVisualization } from "@/components/pages/portfolio-feature/sections-design/sectionsVisualization";
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useViewMode } from "@/hooks/useViewMode";
import { usePublish } from "@/hooks/usePublish";
import { DraggableSection } from "./components/DraggableSection";
import ShareButton from "@/components/ui-tools/custom_ui/ShareButton";
import { Spinner } from "@/components/ui-tools/ui/spinner";
import { usePortfolio } from "@/context/PortfolioContext";
import DrawerEditor from "./DrawerEditor";

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

  // Log portfolio context data
  useEffect(() => {
    console.log("[DisplayPage] Portfolio Context Data:", {
      portfolioId,
      slug,
      timestamp: new Date().toISOString(),
    });
  }, [portfolioId, slug]);

  // Log pages context data
  useEffect(() => {
    console.log("[DisplayPage] Pages Context Data:", {
      pages: pages.map((p) => ({ id: p.id, slug: p.slug })),
      selectedPageId,
      timestamp: new Date().toISOString(),
    });
  }, [pages, selectedPageId]);

  // Log sections context data
  useEffect(() => {
    console.log("[DisplayPage] Sections Context Data:", {
      sectionsCount: sections.length,
      sections: sections.map((s) => ({ id: s.id, type: s.type })),
      isSectionsLoading,
      syncError,
      timestamp: new Date().toISOString(),
    });
  }, [sections, isSectionsLoading, syncError]);

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

  // Log portfolio refresh trigger
  useEffect(() => {
    console.log("[DisplayPage] Refreshing portfolio data...", {
      portfolioId,
      timestamp: new Date().toISOString(),
    });
    refreshPortfolioData();
  }, [refreshPortfolioData]);

  // Auto-save every 5 seconds if there are pending changes
  useEffect(() => {
    console.log("[DisplayPage] Auto-save state:", {
      hasPendingChanges,
      isSectionsLoading,
      timestamp: new Date().toISOString(),
    });

    if (!hasPendingChanges || isSectionsLoading) {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
      return;
    }

    if (!autoSaveIntervalRef.current) {
      autoSaveIntervalRef.current = setInterval(async () => {
        try {
          console.log("[DisplayPage] Auto-saving sections...", {
            timestamp: new Date().toISOString(),
          });
          await savePendingChanges();
          console.log("[DisplayPage] Auto-save completed", {
            timestamp: new Date().toISOString(),
          });
          setShowSavedIndicator(true);
          setTimeout(() => setShowSavedIndicator(false), 2000);
        } catch (err) {
          console.error("[DisplayPage] Auto-save failed:", err);
        }
      }, 3000);
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
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
    if (!selectedSectionId) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    // Wait for DOM updates (sortable reflows etc.) before querying the element
    requestAnimationFrame(() => {
      const el = container.querySelector(`[data-section-id="${selectedSectionId}"]`) as HTMLElement | null;
      console.debug("[DisplayPage] scrollTo selectedSectionId", { selectedSectionId, found: !!el });
      if (!el) return;

      try {
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      } catch (err) {
        // Fallback: compute offset relative to container
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        if (elRect.top < containerRect.top || elRect.bottom > containerRect.bottom) {
          const offset = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
          container.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
        }
      }
    });
  }, [selectedSectionId]);

  return (
    <div className="h-full min-h-0 flex flex-col gap-4 xl:p-5 p-2 bg-card-bg">
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

          {/* Auto-save status indicator */}
          <div className="text-sm text-gray-500">
            {isSectionsLoading && !showSavedIndicator ? (
              <div className="flex items-center gap-1">
                <Spinner className="size-4" />
                Saving...
              </div>
            ) : showSavedIndicator ? (
              <div className="flex items-center gap-1 text-description">
                <Check className="size-4" />
                Saved
              </div>
            ) : hasPendingChanges ? (
              <div className="flex items-center gap-1">
                <Spinner className="size-4" />
                Saving...
              </div>
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
            const baseConfig = headerInst ? headerInst.config : headerDef.defaultConfig;
            const cfg = {
              ...(headerDef.defaultConfig as any),
              ...(baseConfig as any),
              portfolioId,
              pages: pages.map((p) => ({ id: p.id, title: p.slug, slug: p.slug })),
            };

            const isActive = cfg?.active !== false;
            if (!isActive) return null;

            return (
              <div
                className=""
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  const link = target.closest("a");
                  if (link && link.getAttribute("href")?.startsWith("?page=")) {
                    e.preventDefault();
                    const pageId = link.getAttribute("href")?.split("=")[1];
                    if (pageId) setSelectedPageId(pageId);
                  }
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
