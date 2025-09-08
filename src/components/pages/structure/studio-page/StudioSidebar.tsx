"use client";

import { GripVertical, Layout, ImageIcon, Type, Square, Navigation, Palette, Edit3, Star, Plus, Minus } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useStudio } from "@/context/StudioContext";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DisplayPage from "./DisplayPage";

// Color constants
const COLORS = {
  // Background colors
  sidebar: "bg-white",
  itemHover: "hover:bg-black/10",
  gripHover: "hover:bg-accent/10",
  iconBackground: "bg-accent",
  buttonHover: "hover:bg-black/10",
  removeHover: "hover:bg-accent/20",
  addHover: "hover:bg-[#c2e1c2]",

  // Text colors
  grip: "text-gray-400",
  icon: "text-white",
  sectionName: "text-title",
  label: "text-description",
  buttonIcon: "text-black",
  removeIcon: "text-red-500",
  addIcon: "text-green-700",
  emptyText: "text-gray-400",
  assetsText: "text-gray-500",
} as const;

interface Section {
  id: string;
  name: string;
  icon: any;
  type: string;
}

const initialUsed: Section[] = [
  { id: "header", name: "Header", icon: Layout, type: "header" },
  { id: "hero", name: "Hero Section", icon: Star, type: "hero" },
  {
    id: "navigation",
    name: "Navigation",
    icon: Navigation,
    type: "navigation",
  },
];

const initialUnused: Section[] = [
  { id: "footer", name: "Footer", icon: Square, type: "footer" },
  { id: "gallery", name: "Image Gallery", icon: ImageIcon, type: "gallery" },
  {
    id: "testimonials",
    name: "Testimonials",
    icon: Type,
    type: "testimonials",
  },
  { id: "contact", name: "Contact Form", icon: Layout, type: "contact" },
];
export default function StudioSidebar() {
  const { setSections } = useStudio();
  // local state keeps full Section (with icon) while context stores lightweight representation
  const [usedSections, setUsedSections] = useState<Section[]>(initialUsed);
  const [unusedSections, setUnusedSections] = useState<Section[]>(initialUnused);

  // sync outward when internal changes (local drag modifications) happen
  useEffect(() => {
    setSections({
      used: usedSections.map(({ id, name, type }) => ({ id, name, type })),
      available: unusedSections.map(({ id, name, type }) => ({ id, name, type })),
    });
  }, [usedSections, unusedSections, setSections]);

  function SectionItem({
    section,
    isUsed,
    onAdd,
    onRemove,
  }: {
    section: Section;
    isUsed: boolean;
    onAdd?: (id: string) => void;
    onRemove?: (id: string) => void;
  }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id: section.id });
    const IconComponent = section.icon;

    return (
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform) }}
        className={`group flex items-center gap-3 p-2.5 rounded-md ${COLORS.itemHover} ${isDragging ? "opacity-50" : ""}`}
      >
        <div {...attributes} {...listeners} className={`cursor-grab p-1 rounded ${COLORS.gripHover}`}>
          <GripVertical className={`w-3.5 h-3.5 ${COLORS.grip}`} />
        </div>

        <div className={`w-8 h-8 ${COLORS.iconBackground}  rounded-md flex items-center justify-center`}>
          <IconComponent className={`w-4 h-4 ${COLORS.icon}`} />
        </div>

        <span className={`flex-1 text-sm font-medium ${COLORS.sectionName} truncate`}>{section.name}</span>

        <div className="flex gap-1 items-center">
          {isUsed ? (
            <>
              <button
                onClick={() => onRemove?.(section.id)}
                className={`p-1.5 ${COLORS.removeHover} rounded opacity-0 cursor-pointer group-hover:opacity-100 transition-opacity`}
                title="Remove"
              >
                <Minus className={`w-3.5 h-3.5 ${COLORS.removeIcon}`} />
              </button>
              <button className={`p-1.5 cursor-pointer ${COLORS.buttonHover} rounded`} title="Design">
                <Palette className={`w-3.5 h-3.5 cursor-pointer ${COLORS.buttonIcon}`} />
              </button>
              <button className={`p-1.5 cursor-pointer ${COLORS.buttonHover} rounded`} title="Edit">
                <Edit3 className={`w-3.5 h-3.5 cursor-pointer ${COLORS.buttonIcon}`} />
              </button>
            </>
          ) : (
            <button onClick={() => onAdd?.(section.id)} className={`p-1.5 cursor-pointer ${COLORS.addHover} rounded`} title="Add">
              <Plus className={`w-3.5 h-3.5 ${COLORS.addIcon}`} />
            </button>
          )}
        </div>
      </div>
    );
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeInUsed = usedSections.find((s) => s.id === active.id);
    const activeInUnused = unusedSections.find((s) => s.id === active.id);
    const overInUsed = usedSections.find((s) => s.id === over.id);

    if (activeInUsed && overInUsed) {
      // Reorder within used sections
      setUsedSections((sections) => {
        const oldIndex = sections.findIndex((s) => s.id === active.id);
        const newIndex = sections.findIndex((s) => s.id === over.id);
        return arrayMove(sections, oldIndex, newIndex);
      });
    } else if (activeInUnused && !overInUsed) {
      // Reorder within unused sections
      setUnusedSections((sections) => {
        const oldIndex = sections.findIndex((s) => s.id === active.id);
        const newIndex = sections.findIndex((s) => s.id === over.id);
        return arrayMove(sections, oldIndex, newIndex);
      });
    }
  };

  const moveToUsed = (id: string) => {
    const section = unusedSections.find((s) => s.id === id);
    if (section) {
      setUsedSections((prev) => [...prev, section]);
      setUnusedSections((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const moveToUnused = (id: string) => {
    const section = usedSections.find((s) => s.id === id);
    if (section) {
      setUnusedSections((prev) => [...prev, section]);
      setUsedSections((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <Sidebar className={` ${COLORS.sidebar}`}>
        <SidebarContent className="p-4">
          <Tabs defaultValue="sections" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
            </TabsList>

            <TabsContent value="sections" className="space-y-4">
              <SidebarGroup>
                <SidebarGroupLabel className={`text-xs font-semibold ${COLORS.label} mb-2 uppercase`}>
                  Used Sections ({usedSections.length})
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SortableContext items={usedSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-1">
                      {usedSections.map((section) => (
                        <SectionItem
                          key={section.id}
                          section={section}
                          isUsed={true}
                          onRemove={(id) => {
                            moveToUnused(id);
                          }}
                        />
                      ))}
                      {usedSections.length === 0 && (
                        <div className={`text-center py-6 ${COLORS.emptyText} text-sm`}>No sections added yet</div>
                      )}
                    </div>
                  </SortableContext>
                </SidebarGroupContent>
              </SidebarGroup>

              <div className="h-[1px] w-full bg-black/10" />

              <SidebarGroup>
                <SidebarGroupLabel className={`text-xs font-semibold ${COLORS.label} mb-2 uppercase`}>
                  Available Sections ({unusedSections.length})
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SortableContext items={unusedSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-1">
                      {unusedSections.map((section) => (
                        <SectionItem
                          key={section.id}
                          section={section}
                          isUsed={false}
                          onAdd={(id) => {
                            moveToUsed(id);
                          }}
                        />
                      ))}
                      {unusedSections.length === 0 && (
                        <div className={`text-center py-6 ${COLORS.emptyText} text-sm`}>All sections are in use</div>
                      )}
                    </div>
                  </SortableContext>
                </SidebarGroupContent>
              </SidebarGroup>
            </TabsContent>

            <TabsContent value="assets" className="mt-4">
              <div className={`text-center ${COLORS.assetsText} py-8`}>
                <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Assets content will be added here</p>
              </div>
            </TabsContent>
          </Tabs>
        </SidebarContent>
      </Sidebar>
    </DndContext>
  );
}
