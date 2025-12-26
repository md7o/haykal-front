/**
 * Reusable components for Studio Display
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit3, GripVertical, Trash2 } from "lucide-react";

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
      style={style}
      onClick={onSelect}
      className={`relative ${
        isSelected
          ? "border-2 border-dashed py-3 border-accent/60 shadow-sm"
          : "border-2 border-card-border/20 border-dashed py-3 hover:border-accent/30 transition-colors"
      } ${isDragging ? "cursor-grabbing" : ""}`}
    >
      {isSelected && (
        <div className="absolute top-1 left-1 z-50 flex items-center gap-2 bg-black/10 backdrop-blur px-1.5 py-1 rounded-soft shadow-md">
          <button
            className="p-1.5 rounded hover:bg-black/10 cursor-pointer"
            aria-label="Edit section"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit3 className="w-4 h-4 text-description" />
          </button>
          <button
            className={`p-1.5 rounded cursor-grab hover:bg-black/10 ${isDragging ? "cursor-grabbing" : ""}`}
            {...attributes}
            {...listeners}
            aria-label="Drag section"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4 text-description" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-black/10 cursor-pointer"
            aria-label="Delete section"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 className="w-4 h-4 text-description" />
          </button>
        </div>
      )}
      <div className="rounded-soft overflow-hidden">{children}</div>
    </div>
  );
}
