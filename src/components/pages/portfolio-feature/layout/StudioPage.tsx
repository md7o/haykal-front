"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/shadcn_ui/sidebar";
import DisplayPage from "./DisplayPage";
import { PagesProvider } from "@/lib/context/PagesContext";
import { SectionProvider } from "@/lib/context/SectionContext";
import StudioSidebar, { StudioSidebarProvider } from "./StudioSidebar";
import { usePageRouting } from "@/hooks/usePageRouting";
import { PortfolioProvider } from "@/lib/context/PortfolioContext";
import StudioBNB from "./StudioBNB";

function StudioContent() {
  usePageRouting();

  return (
    <SidebarProvider>
      <StudioSidebarProvider>
        <StudioSidebar />
        <SidebarInset>
          <DisplayPage />
          <StudioBNB />
        </SidebarInset>
      </StudioSidebarProvider>
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
