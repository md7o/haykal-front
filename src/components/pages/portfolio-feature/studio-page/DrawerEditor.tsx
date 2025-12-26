// This page is the drawer for edit customize section

import { Sheet, SheetContent, SheetClose, SheetTitle } from "@/components/ui-tools/ui/sheet";
import { useStudio } from "@/context/studio-context-logic/StudioContext";
import { sectionsVisualization } from "@/components/pages/portfolio-feature/sections-design/sectionsVisualization";

interface DrawerEditorProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function DrawerEditor({ open, setOpen }: DrawerEditorProps) {
  const { selectedSectionId, used, updateSectionConfig } = useStudio();
  const section = used.find((s) => s.id === selectedSectionId) || null;
  const def = section ? sectionsVisualization[section.type] : null;

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
