"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui-tools/ui/sidebar";
import DisplayPage from "./DisplayPage";
import { StudioProvider } from "@/context/studio-context-logic/StudioContext";
import StudioSidebar from "./StudioSidebar";
import { usePageRouting } from "@/hooks/usePageRouting";

function StudioContent() {
  usePageRouting();

  return (
    <SidebarProvider>
      <StudioSidebar />
      <SidebarInset>
        <DisplayPage />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function StudioPage() {
  return (
    <StudioProvider>
      <StudioContent />
    </StudioProvider>
  );
}
