import React from "react";
import { Sheet, SheetContent, SheetClose, SheetTitle } from "@/components/ui/sheet";
import { useStudio } from "@/context/StudioContext";
import { sectionsRegistry } from "@/components/pages/sections-design/registry/sections-registry";

// Convert DrawerEditor to accept open/setOpen props
interface DrawerEditorProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function DrawerEditor({ open, setOpen }: DrawerEditorProps) {
  const { selectedSectionId, used, updateSectionConfig } = useStudio();
  const section = used.find((s) => s.id === selectedSectionId) || null;
  const def = section ? sectionsRegistry[section.type] : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="bg-white overflow-y-auto ">
        <SheetTitle className="sr-only">Section Editor</SheetTitle>
        {!section && <div className="p-6 text-sm text-description">Select a section to edit.</div>}
        {section && def && (
          <div className="flex flex-col xl:flex-row gap-6">
            {def.Form ? (
              <def.Form
                config={section.config as Record<string, unknown>}
                onChange={(p) => updateSectionConfig(section.id, p as Record<string, unknown>)}
              />
            ) : (
              <div className="p-6 text-sm text-description">No form for this section.</div>
            )}
          </div>
        )}
        <SheetClose className="hidden" />
      </SheetContent>
    </Sheet>
  );
}
