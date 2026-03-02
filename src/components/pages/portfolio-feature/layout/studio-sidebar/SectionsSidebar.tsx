"use client";

import React from "react";
import {
  Layout,
  GripVertical,
  Edit3,
  Minus,
  Plus,
  Star,
  Users2,
  Type,
  Target,
  FileBadge,
  CalendarCheck,
  BriefcaseBusiness,
  Home,
} from "lucide-react";
import { useSection } from "@/lib/context/SectionContext";
import { SectionType } from "@/components/pages/portfolio-feature/sections-design/sectionsVisualization";
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/shadcn_ui/sidebar";
import { DndContext, PointerSensor, useSensors, useSensor, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/shadcn_ui/button";

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  hero: Star,
  socialLinks: Users2,
  career: Target,
  text: Type,
  achievements: FileBadge,
  events: CalendarCheck,
  businessServices: BriefcaseBusiness,
};

interface UsedSectionsProps {
  id: string;
  name: string;
  type: string;
  onRemove: () => void;
  onEdit: () => void;
  onSelect: () => void;
  selected?: boolean;
}

function UsedSections({ id, name, type, onRemove, onEdit, onSelect, selected }: UsedSectionsProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const Icon = ICON_MAP[type] ?? Layout;
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    ...(isDragging ? { opacity: 0.5, zIndex: 50 } : {}),
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group flex items-center gap-3 p-3 rounded-lg bg-card-bg cursor-pointer ${
        isDragging ? "" : "hover:bg-muted/30 transition-all duration-200"
      } ${selected ? "ring-2 ring-accent" : "ring-0"}`}
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
      <span className="flex-1 text-sm font-medium text-title truncate">{name}</span>
      <div
        className={`flex items-center gap-0.5 transition-all duration-200 ${
          isDragging ? "opacity-100" : "xl:opacity-0 hover:opacity-100 group-hover:opacity-100"
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1.5 cursor-pointer rounded-md hover:bg-description/10 transition-colors"
          aria-label="Edit section"
        >
          <Edit3 className="w-3.5 h-3.5 text-description transition-colors" />
        </button>
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
  type: SectionType;
  label: string;
  onAdd: () => void;
}

function AvailableItem({ type, label, onAdd }: AvailableItemProps) {
  const Icon = ICON_MAP[type] ?? Layout;
  return (
    <button
      onClick={onAdd}
      className="flex items-center gap-3 w-full text-left p-3 rounded-base  bg-card-bg hover:opacity-60 hover:scale-[98%] cursor-pointer transition-all duration-200"
    >
      <div className="w-8 h-8 rounded-soft flex items-center justify-center bg-accent hover:bg-primary/10 transition-colors">
        <Icon className="w-4 h-4 text-white hover:text-primary transition-colors" />
      </div>
      <span className="flex-1 text-sm font-medium text-description hover:text-foreground truncate transition-colors">
        {label}
      </span>
      <Plus className="w-4 h-4 transition-all duration-200 text-green-700" />
    </button>
  );
}

interface SectionsSidebarProps {
  onEdit: (id: string) => void;
  onSelectToggle: (id: string, isSelected: boolean) => void;
  selectedSectionId: string | null;
}

export default function SectionsSidebar({ onEdit, onSelectToggle, selectedSectionId }: SectionsSidebarProps) {
  const { sections, availableSections, addSection, removeSection, reorderSections, isSectionsLoading } = useSection();
  const header = sections.find((s) => s.type === "header");

  const didInitRef = React.useRef(false);
  React.useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    const hasHeader = sections.some((s) => s.type === "header");
    if (!hasHeader && sections.length === 0) {
      try {
        addSection("header");
      } catch {}
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const onDragEnd = (evt: DragEndEvent) => {
    const { active, over } = evt;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex >= 0 && newIndex >= 0) reorderSections(oldIndex, newIndex);
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-semibold text-description  uppercase tracking-wider">Header</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="space-y-4">
            <div className="group p-3 rounded-lg bg-card-bg">
              <div className="flex items-center ">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <span className="flex-1 text-sm font-medium text-title truncate px-3">Site Header</span>
              </div>
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* === Used Sections === */}
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-semibold text-description mb-3 uppercase tracking-wider">
          Used Sections ({sections.filter((s) => s.type !== "header").length})
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={sections.filter((u) => u.type !== "header").map((u) => u.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sections
                  .filter((s) => s.type !== "header")
                  .map((s) => (
                    <UsedSections
                      key={s.id}
                      id={s.id}
                      name={s.name}
                      type={s.type}
                      onRemove={() => removeSection(s.id)}
                      onEdit={() => onEdit(s.id)}
                      onSelect={() => onSelectToggle(s.id, selectedSectionId === s.id)}
                      selected={selectedSectionId === s.id}
                    />
                  ))}
                {sections.filter((s) => s.type !== "header").length === 0 && (
                  <div className="text-center py-5 text-xs  rounded-lg text-muted-foreground ">No sections added yet</div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Available Sections
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="space-y-2">
            {availableSections
              .filter((a) => a.type !== "header")
              .map((a) => (
                <AvailableItem
                  key={a.type}
                  type={a.type as SectionType}
                  label={a.label}
                  onAdd={() => addSection(a.type as SectionType)}
                />
              ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
