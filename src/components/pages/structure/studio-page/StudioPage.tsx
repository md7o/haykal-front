"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useStructureContext } from "@/context/StructureContext";
import StudioSidebar from "./StudioSidebar";
import DisplayPage from "./DisplayPage";
import { StudioProvider } from "@/context/StudioContext";
import BottomBar from "./BottomBar";

export default function StudioPage() {
  useStructureContext();

  return (
    <StudioProvider>
      <SidebarProvider>
        <StudioSidebar />
        <SidebarInset>
          <DisplayPage />
          <BottomBar />
        </SidebarInset>
      </SidebarProvider>
    </StudioProvider>
  );
}
