/**
 * Reusable components for Studio Display
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit3, GripVertical, Trash2 } from "lucide-react";

const STYLES = {
  icon: { size: "w-4 h-4", color: "text-description" },
  button: { padding: "p-1.5", border: "rounded" },
  section: { border: "border-2 border-dashed py-12" },
  selectedBorder: "border-accent/60",
  unselectedBorder: "border-black/10",
  hoverBorder: "border-accent/30",
} as const;

type ButtonType = "edit" | "drag" | "remove";

interface ButtonConfig {
  type: ButtonType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hoverClass?: string;
  grabClass?: boolean;
}

const hoverBgClass = "hover:bg-black";

const TOOLBAR_BUTTONS: ButtonConfig[] = [
  { type: "edit", icon: Edit3, label: "Edit section", hoverClass: hoverBgClass },
  { type: "drag", icon: GripVertical, label: "Drag section", grabClass: true, hoverClass: hoverBgClass },
  { type: "remove", icon: Trash2, label: "Delete section", hoverClass: hoverBgClass },
];

interface DraggableSectionProps {
  id: string;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onRemove: () => void;
  children: React.ReactNode;
}

export function DraggableSection({ id, isSelected, onSelect, onEdit, onRemove, children }: DraggableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? "none" : transition,
    ...(isDragging ? { opacity: 0.85, zIndex: 40 } : {}),
  };

  return (
    <div
      ref={setNodeRef}
      data-section-id={id}
      style={style}
      onClick={onSelect}
      className={`relative ${STYLES.section.border} ${
        isSelected
          ? `${STYLES.selectedBorder} shadow-sm`
          : `${STYLES.unselectedBorder} hover:${STYLES.hoverBorder} cursor-pointer hover:opacity-80 transition-all duration-100`
      } ${isDragging ? "cursor-grabbing" : ""}`}
    >
      {isSelected && (
        <div className="absolute top-1 left-1 z-50 flex items-center gap-2 bg-card-bg backdrop-blur px-1.5 py-1 rounded-soft ">
          {TOOLBAR_BUTTONS.map((btn) => {
            const Icon = btn.icon;
            const isGrabButton = btn.type === "drag";
            const handleClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (btn.type === "edit") onEdit();
              if (btn.type === "remove") onRemove();
            };

            return (
              <button
                key={btn.type}
                className={`${STYLES.button.padding} ${STYLES.button.border} ${btn.hoverClass} ${
                  isGrabButton ? `cursor-grab ${isDragging ? "cursor-grabbing" : ""}` : "cursor-pointer"
                }`}
                aria-label={btn.label}
                onClick={isGrabButton ? (e) => e.stopPropagation() : handleClick}
                {...(isGrabButton ? { ...attributes, ...listeners } : {})}
              >
                <Icon className={`${STYLES.icon.size} ${STYLES.icon.color}`} />
              </button>
            );
          })}
        </div>
      )}
      <div className="rounded-soft overflow-hidden">{children}</div>
    </div>
  );
}
