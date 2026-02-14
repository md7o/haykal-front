// This page is the drawer for edit customize section

import { Sheet, SheetContent, SheetClose, SheetTitle } from "@/components/ui-tools/ui/sheet";
import { useSection } from "@/context/SectionContext";
import { sectionsVisualization } from "@/components/pages/portfolio-feature/sections-design/sectionsVisualization";

interface DrawerEditorProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function DrawerEditor({ open, setOpen }: DrawerEditorProps) {
  const { selectedSectionId, sections, updateSectionConfig, isSectionsLoading } = useSection();

  const section = sections.find((s) => s.id === selectedSectionId) || null;
  const def = section ? sectionsVisualization[section.type] : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="overflow-y-auto w-2xl">
        <SheetTitle className="sr-only">Section Editor</SheetTitle>
        {!section && <div className="p-6 text-sm text-description">Select a section to edit.</div>}
        {section && def && (
          <div className="flex flex-col xl:flex-row gap-6">
            {def.Form ? (
              <div className={isSectionsLoading ? "opacity-50 pointer-events-none" : ""}>
                <def.Form
                  config={section.config as Record<string, unknown>}
                  onChange={(p) => updateSectionConfig(section.id, p as Record<string, unknown>)}
                />
              </div>
            ) : (
              <div className="p-6 text-sm text-description">No form for this section.</div>
            )}
            {isSectionsLoading && <div className="p-6 text-sm text-amber-600">Saving changes...</div>}
          </div>
        )}
        <SheetClose className="hidden" />
      </SheetContent>
    </Sheet>
  );
}
