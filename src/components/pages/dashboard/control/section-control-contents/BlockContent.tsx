"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Save,
  Edit2,
  GripVertical,
  Plus,
  Minus,
  Star,
  Users2,
  Target,
  Type,
  FileBadge,
  CalendarCheck,
  BriefcaseBusiness,
  Layout,
} from "lucide-react";
import { useStudio } from "@/context/StudioContext";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createCustomDesign, updatePortfolio, getCustomDesignById, getPortfolioById } from "@/api/portfolio-endpoints";
import { ensureUserPortfolioId, resolveUserPortfolioId } from "@/lib/portfolio-helpers";
import type { SectionType } from "@/components/pages/sections-design/registry/sections-registry";
import { useRouter } from "next/navigation";
import { usePublishedDesign } from "@/context/PublishedDesignContext";
import { useAuth } from "@/context/AuthContext";
import ShareButton from "@/components/ui/custom_ui/ShareButton";

// --- Icon map (shared with Studio, keep minimal here) ---
const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  hero: Star,
  socialLinks: Users2,
  career: Target,
  text: Type,
  achievements: FileBadge,
  events: CalendarCheck,
  businessServices: BriefcaseBusiness,
};

interface UsedItemProps {
  id: string;
  label: string;
  type: string;
  onRemove: () => void;
}

function UsedItem({ id, label, type, onRemove }: UsedItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    ...(isDragging ? { opacity: 0.5, zIndex: 50 } : {}),
  };
  const Icon = ICON_MAP[type] ?? Layout;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 p-3 rounded-lg bg-white cursor-pointer ${
        isDragging ? "" : "hover:bg-muted/30 transition-all duration-200"
      }`}
    >
      <button
        className={`cursor-grab p-1 rounded-md transition-colors ${isDragging ? "cursor-grabbing" : "hover:bg-muted/50"}`}
        {...attributes}
        {...listeners}
        aria-label="Drag"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-description" />
      </button>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-card-bg ${isDragging ? "" : " transition-colors"}`}>
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <span className="flex-1 text-sm font-medium text-title truncate" title={label}>
        {label}
      </span>
      <div
        className={`flex items-center gap-0.5 transition-all duration-200 ${
          isDragging ? "opacity-100" : "xl:opacity-0 group-hover:opacity-100"
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1.5 rounded-md hover:bg-accent/10 transition-colors"
          aria-label="Remove section"
        >
          <Minus className="w-3.5 h-3.5 cursor-pointer text-red-500 transition-colors" />
        </button>
      </div>
    </div>
  );
}

interface AvailableItemProps {
  type: string;
  label: string;
  onAdd: (t: string) => void;
}

function AvailableItem({ type, label, onAdd }: AvailableItemProps) {
  const Icon = ICON_MAP[type] ?? Layout;
  return (
    <button
      onClick={() => onAdd(type)}
      className="flex items-center gap-3 w-full text-left p-3 rounded-base bg-white hover:opacity-60 hover:scale-[98%] cursor-pointer transition-all duration-200"
    >
      <div className="w-8 h-8 rounded-soft flex items-center justify-center bg-card-bg hover:bg-primary/10 transition-colors">
        <Icon className="w-4 h-4 text-description hover:text-primary transition-colors" />
      </div>
      <span className="flex-1 text-sm font-medium text-description hover:text-foreground truncate transition-colors">
        {label}
      </span>
      <Plus className="w-4 h-4 transition-all duration-200 text-green-700" />
    </button>
  );
}

export default function BlockContent() {
  const router = useRouter();
  const {
    used,
    available,
    addSection,
    removeSection,
    reorderUsed,
    updateSectionConfig,
    portfolioId,
    customDesignId,
    setCustomDesignId,
    setPortfolioId,
    loadSections,
  } = useStudio();
  const { refresh } = usePublishedDesign();
  const { user } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isDraggingPage, setIsDraggingPage] = useState(false);
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } })
  );

  const header = useMemo(() => used.find((u) => u.type === "header"), [used]);
  const usedNonHeader = useMemo(() => used.filter((u) => u.type !== "header"), [used]);
  const usedIds = useMemo(() => usedNonHeader.map((u) => u.id), [usedNonHeader]);

  // Keep UI quiet and performant

  // Load sections from backend when a portfolio/customDesign id becomes available
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // prefer explicit ids from context
        let id = customDesignId || portfolioId;
        // if we don't have an id yet, try to resolve one for the authenticated user (without creating a row)
        if (!id) {
          const userId = (user as any)?.userId || (user as any)?.id;
          if (userId) {
            id = await resolveUserPortfolioId(String(userId));
            if (id) {
              setPortfolioId(id);
              setCustomDesignId(id);
            }
          }
        }
        if (!id) return;
        setIsLoadingRemote(true);
        // try unified fetch; fallback stays for safety
        try {
          const design = await getCustomDesignById(id);
          if (!mounted) return;
          if (design && Array.isArray((design as any).sections)) {
            loadSections((design as any).sections as any[]);
          }
        } catch (e) {
          // fallback: try portfolio by id
          try {
            const p = await getPortfolioById(id);
            if (!mounted) return;
            if (p && Array.isArray((p as any).sections)) {
              loadSections((p as any).sections as any[]);
            }
          } catch (err) {
            // Ignore; UI can still function and save to create
          }
        }
      } finally {
        if (mounted) setIsLoadingRemote(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [portfolioId, customDesignId, loadSections]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = isDraggingPage ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [isDraggingPage]);

  const onDragEnd = useCallback(
    (evt: DragEndEvent) => {
      try {
        const { active, over } = evt;
        if (!over || active.id === over.id) return;
        const oldIndex = used.findIndex((s) => s.id === active.id);
        const newIndex = used.findIndex((s) => s.id === over.id);
        if (oldIndex >= 0 && newIndex >= 0) reorderUsed(oldIndex, newIndex);
      } finally {
        setIsDraggingPage(false);
      }
    },
    [used, reorderUsed]
  );

  const onDragStart = useCallback(() => setIsDraggingPage(true), []);

  const portfolioUsedId = portfolioId ?? undefined;

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      // ensure we have a portfolio id for this authenticated user
      let pid = portfolioId;
      if (!pid) {
        const userId = (user as any)?.userId || (user as any)?.id;
        if (!userId) {
          setFeedback("Sign in required to save sections.");
          setIsSaving(false);
          return;
        }
        try {
          pid = await ensureUserPortfolioId(String(userId));
          setPortfolioId(pid);
          setCustomDesignId(pid);
        } catch (e) {
          setFeedback(e instanceof Error ? e.message : "Failed to resolve portfolio id");
          setIsSaving(false);
          return;
        }
      }
      // include cached assets draft if present so theme + sections stay together
      let assets: unknown = undefined;
      try {
        if (typeof window !== "undefined") {
          const draft = sessionStorage.getItem("designAssetsDraft");
          if (draft) assets = JSON.parse(draft);
        }
      } catch {
        /* ignore */
      }
      if (customDesignId || pid) {
        await updatePortfolio(customDesignId || pid!, { sections: used, assets });
        setFeedback("Sections updated successfully.");
      } else {
        const created = await createCustomDesign({ portfolioId: pid!, sections: used, assets });
        if (created?.id) setCustomDesignId(created.id);
        setFeedback("Sections saved successfully.");
      }
      // Ask the published preview to refetch so changes show immediately
      try {
        await refresh();
      } catch {}
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [portfolioId, customDesignId, used, setCustomDesignId, setPortfolioId, user]);

  return (
    <div className="space-y-6 mx-15">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: "var(--color-title)" }}>
            Sections Builder
          </h2>
          <p className="text-sm" style={{ color: "var(--color-description)" }}>
            Drag sections blocks to reorder and click ( + ) to add new blocks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {feedback && (
            <p className="text-xs max-w-[200px] truncate" style={{ color: "var(--color-description)" }} title={feedback}>
              {feedback}
            </p>
          )}

          <Button onClick={handleSave} disabled={isSaving || !used.length} variant="fill" className="gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : customDesignId ? "Update" : "Save"}
          </Button>
          <Button
            type="button"
            onClick={() => router.push("/studio?mode=edit" + (customDesignId ? "?mode=edit" : ""))}
            variant="grayFill"
            className="gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Studio
          </Button>
          <ShareButton portfolioId={portfolioUsedId} />
        </div>
      </div>

      {/* Header group */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-description)" }}>
          Header
        </h3>
        <div className="p-3 rounded-soft bg-white border" style={{ borderColor: "var(--color-card-border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-soft flex items-center justify-center bg-card-bg">
              <Layout className="w-4 h-4 text-accent" />
            </div>
            <span className="flex-1 text-sm font-medium text-title truncate">Site Header</span>
            {header ? (
              <div className="flex items-center gap-2">
                <Button
                  size="small"
                  variant="grayFill"
                  onClick={() => {
                    const curr = (header as any).config?.active !== false;
                    updateSectionConfig(header.id, { active: !curr } as any);
                  }}
                >
                  Toggle
                </Button>
                <Button size="small" variant="grayFill" onClick={() => removeSection(header.id)}>
                  Remove
                </Button>
              </div>
            ) : (
              <Button size="small" variant="fill" onClick={() => addSection("header" as SectionType)}>
                Add Header
              </Button>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-description)" }}>
          Used Sections ({usedNonHeader.length})
        </h3>
        {usedNonHeader.length === 0 ? (
          <div
            className="p-6 border border-dashed rounded-soft text-center text-sm"
            style={{ color: "var(--color-description)", borderColor: "var(--color-card-border)" }}
          >
            No sections yet. Add from below.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            autoScroll={false}
          >
            <SortableContext items={usedIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {usedNonHeader.map((u) => {
                  const label = available.find((a) => a.type === u.type)?.label || u.type;
                  return <UsedItem key={u.id} id={u.id} label={label} type={u.type} onRemove={() => removeSection(u.id)} />;
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="h-px w-full opacity-50 bg-card-border/40" />

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-description)" }}>
          Available Sections
        </h3>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {available.map((a) => (
            <AvailableItem key={a.type} type={a.type} label={a.label} onAdd={(t) => addSection(t as SectionType)} />
          ))}
        </div>
      </div>
    </div>
  );
}
