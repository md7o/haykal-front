"use client";

import React, { useState } from "react";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStudio } from "@/context/StudioContext";
import DrawerEditor from "./DrawerEditor";
import SectionsSidebar from "./studio-sidebar/SectionsSidebar";
import AssetsSidebar from "./studio-sidebar/AssetsSidebar";

export default function StudioSidebar() {
  const { selectSection, selectedSectionId } = useStudio();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Sidebar>
        <SidebarContent className="p-4 studio-sidebar-fixed">
          <Tabs defaultValue="sections" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
            </TabsList>
            <TabsContent value="sections" className="space-y-6">
              <SectionsSidebar
                onEdit={(id) => {
                  selectSection(id);
                  setDrawerOpen(true);
                }}
                onSelectToggle={(id, isSelected) => selectSection(isSelected ? null : id)}
                selectedSectionId={selectedSectionId}
              />
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
