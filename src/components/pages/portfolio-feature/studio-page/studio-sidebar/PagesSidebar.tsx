"use client";
import React, { useState } from "react";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui-tools/ui/sidebar";
import { Button } from "@/components/ui-tools/ui/button";
import PagesDialog from "@/components/ui-tools/custom_ui/DialogStorage";
import { Input } from "@/components/ui-tools/ui/input";
import { Plus, FileText, Pencil, Check, X, Trash2, GripVertical, Home as HomeIcon } from "lucide-react";
import { useStudio } from "@/context/studio-context-logic/StudioContext";
import { type Page } from "@/api/pages-endpoints";
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

// --- Helpers
const isHome = (p: { slug?: string | null; title?: string | null; id?: string | null }) =>
  (p.slug || "").toLowerCase() === "home" || p.title === "Home" || p.id === "home";

const pinHomeFirst = <T extends Page>(arr: T[]) => {
  const home = arr.find(isHome);
  if (!home) return arr;
  const rest = arr.filter((p) => p !== home);
  return [home, ...rest];
};

function SortableRow({
  page,
  active,
  onSelect,
  onRename,
  onDelete,
}: {
  page: Page;
  active: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const isProtected = isHome(page);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page.id,
    disabled: isProtected,
  });
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? "none" : transition,
    ...(isDragging ? { opacity: 0.7, zIndex: 30 } : {}),
  };
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(page.title);
  return (
    <div
      ref={setNodeRef}
      style={style}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      className={`flex items-center gap-2 p-2 rounded-md bg-card-bg ${active ? "ring-2 ring-accent" : ""}`}
    >
      {!isProtected && (
        <Button
          variant={"transparent"}
          size={"icon"}
          className={`p-1.5 rounded cursor-grab hover:bg-black/10 ${isDragging ? "cursor-grabbing" : ""}`}
          {...attributes}
          {...listeners}
          aria-label="Drag page"
        >
          <GripVertical className="w-4 h-4 text-description" />
        </Button>
      )}
      <div className="flex-1 text-left flex items-center gap-2 cursor-pointer">
        {isProtected ? <HomeIcon className="w-4 h-4 text-accent" /> : <FileText className="w-4 h-4 text-description" />}
        {!isEditing ? (
          <span className="text-sm text-title truncate">{page.title}</span>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <Input value={value} onChange={(e) => setValue(e.target.value)} className="h-7" />
            <Button
              size="small"
              variant="outline"
              onClick={(ev) => {
                ev.stopPropagation();
                setIsEditing(false);
                setValue(page.title);
              }}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="small"
              onClick={(ev) => {
                ev.stopPropagation();
                setIsEditing(false);
                onRename(value.trim() || page.title);
              }}
            >
              <Check className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
      {!isEditing && (
        <>
          {!isProtected && (
            <>
              <Button variant="transparent" size="icon" onClick={() => setIsEditing(true)} aria-label="Rename page">
                <Pencil className="w-4 h-4 text-description" />
              </Button>
              <Button variant="transparent" size="icon" onClick={onDelete} aria-label="Delete page">
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function PagesSidebar() {
  const {
    pages,
    selectedPageId,
    setSelectedPageId,
    addPage,
    updatePageDetails,
    deletePage,
    movePage,
    isLoading: isContextLoading,
  } = useStudio();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const selectPage = (id: string | null) => {
    if (!id) return;
    setSelectedPageId(id);
  };

  const handleCreatePage = async (title: string) => {
    const newId = await addPage(title);
    if (newId) {
      selectPage(newId);
    }
  };

  const handleRename = async (id: string, title: string) => {
    await updatePageDetails(id, { title });
  };

  const handleRemove = async (id: string) => {
    await deletePage(id);
  };

  const handleDragEnd = async (evt: DragEndEvent) => {
    const { active, over } = evt;
    if (!over || active.id === over.id) return;

    const sortedPages = pinHomeFirst([...pages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    const oldIndex = sortedPages.findIndex((p) => p.id === active.id);
    const newIndex = sortedPages.findIndex((p) => p.id === over.id);

    if (oldIndex < 0 || newIndex < 0) return;

    await movePage(oldIndex, newIndex);
  };

  const sortedPages = pinHomeFirst([...pages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-semibold text-description mb-3 uppercase tracking-wider">
          Pages
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="space-y-2">
            <PagesDialog
              title="New Page"
              content="Give the page a name"
              showInput
              initialValue=""
              trigger={
                <Button className="w-full" variant="grayFill">
                  <Plus className="w-4 h-4 mr-1" /> New Page
                </Button>
              }
              confirmLabel="Create"
              onConfirm={async (val) => {
                const t = (String(val ?? "New Page") || "New Page").trim() || "New Page";
                await handleCreatePage(t);
              }}
            />
            {isContextLoading && pages.length === 0 ? (
              <div className="text-xs text-description">Loading pages...</div>
            ) : pages.length === 0 ? (
              <div className="text-xs text-muted-foreground border border-dashed rounded p-3">No pages yet</div>
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
                      <SortableRow
                        key={p.id}
                        page={p}
                        active={p.id === selectedPageId}
                        onSelect={() => selectPage(p.id)}
                        onRename={(t) => handleRename(p.id, t)}
                        onDelete={() => handleRemove(p.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
