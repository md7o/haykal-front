"use client";

import { Edit } from "lucide-react";
import { Button } from "@/components/ui-tools/ui/button";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui-tools/ui/sidebar";
import AiSidebar from "./SidebarAi";

export interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" || isMobile;

  return (
    <main className="flex-1 flex flex-col bg-card-bg relative">
      {/* Mobile/Collapsed Header */}
      {isCollapsed && (
        <div className="flex items-center gap-2 absolute top-0 left-0 p-2 z-10">
          <Button variant="grayFill" size="icon" asChild>
            <SidebarTrigger />
          </Button>
          <Button variant="grayFill" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Page Content */}
      {children}
    </main>
  );
}

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider style={{ "--sidebar-width": "20rem" } as React.CSSProperties}>
      <div className="flex w-full min-h-screen">
        <AiSidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}
