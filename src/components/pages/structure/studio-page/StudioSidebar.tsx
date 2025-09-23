"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  GripVertical,
  Layout,
  Users2,
  Edit3,
  Star,
  Plus,
  Minus,
  Type,
  Target,
  FileBadge,
  CalendarCheck,
  BriefcaseBusiness,
} from "lucide-react";

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStudio } from "@/context/StudioContext";
import { SectionType } from "@/components/pages/sections-design/registry/sections-registry";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import DrawerEditor from "./DrawerEditor";

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const ICON_MAP: Record<string, IconComponent> = {
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
  name: string;
  type: string;
  onRemove: () => void;
  onEdit: () => void;
  onSelect: () => void;
  selected?: boolean;
}

function UsedItem({ id, name, type, onRemove, onEdit, onSelect, selected }: UsedItemProps) {
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

      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white ${isDragging ? "" : " transition-colors"}`}>
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
      <div className="w-8 h-8 rounded-soft flex items-center justify-center bg-white hover:bg-primary/10 transition-colors">
        <Icon className="w-4 h-4 text-description hover:text-primary transition-colors" />
      </div>
      <span className="flex-1 text-sm font-medium text-description hover:text-foreground truncate transition-colors">
        {label}
      </span>
      <Plus className="w-4 h-4 transition-all duration-200 text-green-700" />
    </button>
  );
}

export default function StudioSidebar() {
  const { used, available, addSection, removeSection, reorderUsed, selectSection, selectedSectionId } = useStudio();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [, setSelectedFont] = useState<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const onDragEnd = (evt: DragEndEvent) => {
    const { active, over } = evt;
    if (!over || active.id === over.id) return;
    const oldIndex = used.findIndex((s) => s.id === active.id);
    const newIndex = used.findIndex((s) => s.id === over.id);
    if (oldIndex >= 0 && newIndex >= 0) reorderUsed(oldIndex, newIndex);
  };

  const colorCombinations = useMemo(
    () => [
      { name: "Default", primary: "", secondary: "" },
      { name: "Sunset", primary: "#9b671f", secondary: "#fffae5" },
      { name: "Forest", primary: "#29746f", secondary: "#e0fff8" },
      { name: "Ocean", primary: "#276e94", secondary: "#ddeeff" },
      { name: "Night", primary: "#2c3e50", secondary: "#d0d8eb" },
      { name: "Pinky", primary: "#4b2c50", secondary: "#ffeafd" },
      { name: "Redy", primary: "#6d1818", secondary: "#ffdddd" },
      { name: "Oily", primary: "#45502c", secondary: "#edfcd9" },
      { name: "Dirty", primary: "#50422c", secondary: "#fff9ea" },
    ],
    []
  );

  const fontOptions = useMemo(
    () => [
      { label: "Montserrat", value: '"Montserrat", sans-serif' },
      { label: "Roboto", value: '"Roboto", sans-serif' },
      { label: "Lobster", value: '"lobster", Montserrat' },
      { label: "Inconsolata", value: '"inconsolata", Montserrat' },
      { label: "Tagesschrift", value: '"tagesschrift", Montserrat' },
      { label: "Caveat", value: '"caveat", Montserrat' },
    ],
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const bodyStyles = getComputedStyle(document.body);
    const rootStyles = getComputedStyle(document.documentElement);
    const fontVar = (bodyStyles.getPropertyValue("--font-montserrat") || rootStyles.getPropertyValue("--font-montserrat")).trim();
    setSelectedFont(fontVar || '"Montserrat", sans-serif');
  }, []);

  const applyColorCombination = (combination: { primary: string; secondary: string }) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement.style;
    const primary = (combination.primary || "").trim();
    const secondary = (combination.secondary || "").trim();

    // If a value is provided, set the corresponding CSS var; otherwise remove it so defaults apply
    if (primary) {
      root.setProperty("--color-accent-cus", primary);
      root.setProperty("--color-title-cus", primary);
      root.setProperty("--primary-cus", primary);
      root.setProperty("--accent-cus", primary);
      root.setProperty("--ring-cus", primary);
    } else {
      root.removeProperty("--color-accent-cus");
      root.removeProperty("--color-title-cus");
      root.removeProperty("--primary-cus");
      root.removeProperty("--accent-cus");
      root.removeProperty("--ring-cus");
    }

    if (secondary) {
      root.setProperty("--color-card-bg-cus", secondary);
      root.setProperty("--color-secondary-cus", secondary);
      root.setProperty("--card-cus", secondary);
      root.setProperty("--muted-cus", secondary);
    } else {
      root.removeProperty("--color-card-bg-cus");
      root.removeProperty("--color-secondary-cus");
      root.removeProperty("--card-cus");
      root.removeProperty("--muted-cus");
    }

    // Keep fallback defaults if explicitly needed
    if (!primary && !secondary) {
      // remove any explicit background/border custom properties so theme defaults show
      root.removeProperty("--background-cus");
      root.removeProperty("--border-cus");
    } else {
      root.setProperty("--background-cus", "#ffffff");
      root.setProperty("--border-cus", "#808080");
    }
  };

  const handleFontChange = (value: string) => {
    setSelectedFont(value);
    if (typeof window === "undefined") return;
    document.documentElement.style.setProperty("--font-montserrat-cus", value);
    document.body.style.setProperty("--font-montserrat-cus", value);
  };

  return (
    <>
      <Sidebar className="bg-background">
        <SidebarContent className="p-4">
          <Tabs defaultValue="sections" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
            </TabsList>

            <TabsContent value="sections" className="space-y-6">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-description mb-3 uppercase tracking-wider">
                  Used Sections ({used.length})
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    onDragEnd={onDragEnd}
                  >
                    <SortableContext items={used.map((u) => u.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {used.map((s) => (
                          <UsedItem
                            key={s.id}
                            id={s.id}
                            name={s.name}
                            type={s.type}
                            onRemove={() => removeSection(s.id)}
                            onEdit={() => {
                              selectSection(s.id);
                              setDrawerOpen(true);
                            }}
                            onSelect={() => selectSection(selectedSectionId === s.id ? null : s.id)}
                            selected={selectedSectionId === s.id}
                          />
                        ))}

                        {used.length === 0 && (
                          <div className="text-center py-8 text-xs border border-dashed border-card-border rounded-lg text-muted-foreground bg-muted/20">
                            <Layout className="w-6 h-6 mx-auto mb-2 opacity-30" />
                            No sections added yet
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </DndContext>
                </SidebarGroupContent>
              </SidebarGroup>

              <div className="h-px w-full bg-border opacity-50" />

              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Available Sections
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="space-y-2">
                    {available.map((a) => (
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
            </TabsContent>

            {/* === Assets Section === */}
            <TabsContent value="assets">
              <SidebarGroup>
                <SidebarGroupLabel className="font-bold text-description uppercase mb-3 tracking-wider">
                  Colors Theme
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="mb-4 bg-card-bg  p-5 rounded-lg">
                    <div className="grid grid-cols-3 gap-2">
                      {colorCombinations.map((combo, idx) => (
                        <button
                          key={combo.name}
                          onClick={() => applyColorCombination(combo)}
                          className="group relative flex rounded-full overflow-hidden shadow-md hover:border-accent transition-all duration-200 hover:scale-105 cursor-pointer"
                          title={combo.name}
                        >
                          <div className="w-1/2 h-16" style={{ backgroundColor: combo.primary }} />
                          <div className="w-1/2 h-16" style={{ backgroundColor: combo.secondary }} />
                          {idx === 0 && (
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white bg-black/30">
                              {combo.name}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>

              <div className="h-px my-5 w-full bg-card-border opacity-50" />

              <SidebarGroup>
                <SidebarGroupLabel className="font-bold text-description uppercase mb-3 tracking-wider">
                  Fonts Theme
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="grid grid-cols-2 gap-2">
                    {fontOptions.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => handleFontChange(opt.value)}
                        className="flex items-center justify-center text-xl h-12 rounded-md bg-card-bg transition-all duration-200 hover:scale-105 cursor-pointer"
                        title={opt.label}
                        style={{ fontFamily: opt.value }}
                      >
                        ABC
                      </button>
                    ))}
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </TabsContent>
          </Tabs>
        </SidebarContent>
      </Sidebar>

      <DrawerEditor open={drawerOpen} setOpen={setDrawerOpen} />
    </>
  );
}
