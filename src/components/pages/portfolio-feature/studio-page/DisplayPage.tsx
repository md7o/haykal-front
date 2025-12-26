"use client";

import { useStudio } from "@/context/studio-context-logic/StudioContext";
import { useUserPortfolio } from "@/context/UserPortfolioContext";
import { useState, useEffect, useMemo, useCallback } from "react";
import { MonitorSmartphone, Share, Smartphone } from "lucide-react";
import { Button } from "@/components/ui-tools/ui/button";
import DialogStorage from "@/components/ui-tools/custom_ui/DialogStorage";
import { sectionsVisualization } from "@/components/pages/portfolio-feature/sections-design/sectionsVisualization";
import PortfolioTheme from "@/components/theme/PortfolioTheme";
import DrawerEditor from "./DrawerEditor";
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useViewMode } from "@/hooks/useViewMode";
import { usePublish } from "@/hooks/usePublish";
import { applyAssetsToDom } from "@/lib/theme-utils";
import { DraggableSection } from "./components/DraggableSection";

export default function DisplayPage() {
  const {
    used,
    selectedSectionId,
    portfolioId,
    assets,
    selectSection,
    reorderUsed,
    removeSection,
    selectedPageId,
    setSelectedPageId,
    pages,
    refreshPortfolioData,
    slug,
  } = useStudio();

  const { portfolioData } = useUserPortfolio();
  const isPublished = portfolioData?.status === "PUBLISHED";

  const [view, setView] = useViewMode();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
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
  } = usePublish(portfolioId, selectedPageId, used, refreshPortfolioData);

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
    if (assets) applyAssetsToDom(assets);
  }, [assets]);

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
          <Button onClick={handlePublishClick} disabled={isPublishing || !used.length}>
            <Share className="inline w-4 h-4 mr-1" />
            {isPublishing ? (isPublished ? "Updating..." : "Publishing...") : isPublished ? "Update" : "Publish"}
          </Button>

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

      <PortfolioTheme
        assets={assets || undefined}
        className={`flex-1 min-h-0  ${
          view === "mobile" ? "xl:w-[26rem] w-full mx-auto" : "w-full mx-auto"
        } rounded-soft transition-all duration-300`}
      >
        <div className="h-full flex flex-col min-h-0 ">
          {/* Header */}
          {(() => {
            const headerDef = sectionsVisualization["header"];
            if (!headerDef) return null;

            const headerInst = used.find((s) => s.type === "header");
            const baseConfig = headerInst ? headerInst.config : headerDef.defaultConfig;
            const cfg = {
              ...(headerDef.defaultConfig as any),
              ...(baseConfig as any),
              portfolioId,
              pages: pages.map((p) => ({ id: p.id, title: p.title, slug: p.slug })),
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
                <headerDef.Design config={cfg} view={view} isPreview={true} />
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
                  const def = sectionsVisualization[sec.type];
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
