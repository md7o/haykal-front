"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui-tools/ui/sidebar";
import DisplayPage from "./DisplayPage";
import { PagesProvider } from "@/context/PagesContext";
import { SectionProvider } from "@/context/SectionContext";
import StudioSidebar from "./StudioSidebar";
import { usePageRouting } from "@/hooks/usePageRouting";
import { PortfolioProvider } from "@/context/PortfolioContext";

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

export default function StudioPage({ id }: { id: string }) {
  return (
    <PortfolioProvider portfolioId={id}>
      <PagesProvider>
        <SectionProvider>
          <StudioContent />
        </SectionProvider>
      </PagesProvider>
    </PortfolioProvider>
  );
}
