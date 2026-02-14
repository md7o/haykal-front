"use client";

import { useState } from "react";
import { usePages } from "@/context/PagesContext";
import { isHome } from "@/context/hooks/studio-utils";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui-tools/ui/sidebar";
import { Button } from "@/components/ui-tools/ui/button";
import { Input } from "@/components/ui-tools/ui/input";
import { Plus, FileText, Pencil, Check, X, Trash2, GripVertical, Home } from "lucide-react";
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Page } from "@/api/portfolios-api/pages-endpoints";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui-tools/ui/dialog";

function PageRow({
  page,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: {
  page: Page;
  isActive: boolean;
  onSelect: () => void;
  onRename: (s: string) => void;
  onDelete: () => void;
}) {
  const isProtected = isHome(page);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page.id,
    disabled: isProtected,
  });
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(page.slug);

  const save = () => {
    if (value.trim() && value !== page.slug) onRename(value.trim());
    setEditing(false);
    setValue(page.slug);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition: isDragging ? "none" : transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      onClick={onSelect}
      className={`flex items-center gap-2 p-2 mt-2 rounded-md bg-card-bg cursor-pointer ${isActive ? "ring-2 ring-accent" : "hover:bg-card-bg/80"}`}
    >
      {!isProtected && (
        <Button
          variant={"transparent"}
          size={"icon"}
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing"
          aria-label="Drag"
        >
          <GripVertical className="w-4 h-4 text-description" />
        </Button>
      )}
      {isProtected ? (
        <Home className="w-4 h-4 text-accent flex-shrink-0" />
      ) : (
        <FileText className="w-4 h-4 text-description flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        {!editing ? (
          <span className="text-sm truncate">{page.slug}</span>
        ) : (
          <Input value={value} onChange={(e) => setValue(e.target.value)} autoFocus onClick={(e) => e.stopPropagation()} />
        )}
      </div>
      {!editing && !isProtected && (
        <div className="flex gap-1">
          <Button
            variant={"transparent"}
            size={"icon"}
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            className="p-1 hover:bg-accent/20 rounded"
          >
            <Pencil className="w-3 h-3 text-description" />
          </Button>
          <Button
            variant={"transparent"}
            size={"icon"}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-error/20 rounded"
          >
            <Trash2 className="w-3 h-3 text-error" />
          </Button>
        </div>
      )}
      {editing && (
        <div className="flex gap-1">
          <Button
            variant={"transparent"}
            size={"icon"}
            onClick={(e) => {
              e.stopPropagation();
              setEditing(false);
              setValue(page.slug);
            }}
            className="p-1 hover:bg-error/20 rounded"
          >
            <X className="w-3 h-3" />
          </Button>
          <Button
            variant={"transparent"}
            size={"icon"}
            onClick={(e) => {
              e.stopPropagation();
              save();
            }}
            className="p-1 hover:bg-accent/20 rounded"
          >
            <Check className="w-3 h-3 text-accent" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function PagesSidebar() {
  const { pages, selectedPageId, setSelectedPageId, addPage, updatePageDetails, deletePage, reorderPages } = usePages();
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const sorted = [...pages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const home = sorted.find(isHome);
  const rest = sorted.filter((p) => !isHome(p));
  const sortedPages = home ? [home, ...rest] : rest;

  const handleCreate = async () => {
    setError(null);
    const s = slug.trim().toLowerCase();
    if (!s) {
      setError("Slug required");
      return;
    }
    if (s === "home") {
      setError("Cannot create 'home' page");
      return;
    }
    if (pages.some((p) => p.slug.toLowerCase() === s)) {
      setError("Slug already exists");
      return;
    }

    try {
      await addPage(s);
      setSlug("");
      setOpen(false);
    } catch (err) {
      setError((err as Error).message || "Failed to create page");
    }
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = sortedPages.findIndex((p) => p.id === active.id);
    const newIdx = sortedPages.findIndex((p) => p.id === over.id);
    if (oldIdx >= 0 && newIdx >= 0) {
      const reorderedIds = Array.from(sortedPages);
      const [movedPage] = reorderedIds.splice(oldIdx, 1);
      reorderedIds.splice(newIdx, 0, movedPage);
      try {
        await reorderPages(reorderedIds.map((p) => p.id));
      } catch (err) {
        console.error("Failed to reorder pages:", err);
      }
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold uppercase">Pages</SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="space-y-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="fill">
                <Plus className="w-4 h-4 mr-2" /> New Page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Create Page</DialogTitle>
              </DialogHeader>
              {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="page-slug"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreate} disabled={!slug.trim()}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {pages.length === 0 ? (
            <div className="text-xs text-center p-3 border border-dashed rounded">No pages</div>
          ) : (
            <DndContext
              modifiers={[restrictToVerticalAxis]}
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sortedPages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                  {sortedPages.map((p) => (
                    <PageRow
                      key={p.id}
                      page={p}
                      isActive={p.id === selectedPageId}
                      onSelect={() => setSelectedPageId(p.id)}
                      onRename={(s) => updatePageDetails(p.id, { slug: s })}
                      onDelete={() => confirm("Delete page?") && deletePage(p.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
