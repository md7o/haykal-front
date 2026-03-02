"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/shadcn_ui/sidebar";
import DisplayPage from "./DisplayPage";
import { PagesProvider } from "@/lib/context/PagesContext";
import { SectionProvider } from "@/lib/context/SectionContext";
import StudioSidebar from "./StudioSidebar";
import { usePageRouting } from "@/hooks/usePageRouting";
import { PortfolioProvider } from "@/lib/context/PortfolioContext";

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
