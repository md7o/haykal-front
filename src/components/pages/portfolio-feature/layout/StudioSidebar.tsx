"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { Sidebar, SidebarContent } from "@/components/ui/shadcn_ui/sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/shadcn_ui/tabs";
import { useSection } from "@/lib/context/SectionContext";
import DrawerEditor from "./DrawerEditor";
import SectionsSidebar from "./studio-sidebar/SectionsSidebar";
import AssetsSidebar from "./studio-sidebar/AssetsSidebar";
import PagesSidebar from "./studio-sidebar/PagesSidebar";

type StudioSidebarTab = "sections" | "pages" | "assets";

interface StudioSidebarContextProps {
  activeTab: StudioSidebarTab;
  setActiveTab: (tab: StudioSidebarTab) => void;
}

const StudioSidebarContext = createContext<StudioSidebarContextProps | undefined>(undefined);

export function useStudioSidebar() {
  const context = useContext(StudioSidebarContext);
  if (!context) {
    throw new Error("useStudioSidebar must be used within StudioSidebarProvider");
  }
  return context;
}

export function StudioSidebarProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<StudioSidebarTab>("sections");
  return <StudioSidebarContext.Provider value={{ activeTab, setActiveTab }}>{children}</StudioSidebarContext.Provider>;
}

export default function StudioSidebar() {
  const { setSelectedSectionId, selectedSectionId } = useSection();
  const { activeTab, setActiveTab } = useStudioSidebar();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Sidebar className="bg-card-main">
        <SidebarContent className="p-4 studio-sidebar-fixed bg-card-main">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StudioSidebarTab)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="pages">Pages</TabsTrigger>
              <TabsTrigger value="assets">Themes</TabsTrigger>
            </TabsList>
            <TabsContent value="sections" className="space-y-6">
              <SectionsSidebar
                onEdit={(id) => {
                  setSelectedSectionId(id);
                  setDrawerOpen(true);
                }}
                onSelectToggle={(id, isSelected) => setSelectedSectionId(isSelected ? null : id)}
                selectedSectionId={selectedSectionId}
              />
            </TabsContent>
            <TabsContent value="pages">
              <PagesSidebar />
            </TabsContent>
            <TabsContent value="assets">
              <AssetsSidebar />
            </TabsContent>
          </Tabs>
        </SidebarContent>
      </Sidebar>
      <DrawerEditor open={drawerOpen} setOpen={setDrawerOpen} />
    </>
  );
}
