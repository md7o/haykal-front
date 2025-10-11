"use client";

import SidebarDashboard from "@/components/pages/dashboard/SidebarDashboard";
import HeaderDashboard from "@/components/pages/dashboard/HeaderDashboard";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import type { CSSProperties, ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const sidebarStyles = { "--sidebar-width": "20rem" } as CSSProperties;
  return (
    <SidebarProvider defaultOpen={true} style={sidebarStyles}>
      <div className="flex h-screen w-screen overflow-hidden">
        <SidebarDashboard />
        <SidebarInset className="flex flex-col flex-1 min-h-0">
          <header className="w-full flex-shrink-0">
            <HeaderDashboard />
          </header>
          {/* Content region fills remaining height */}
          <main className="flex-1 min-h-0 bg-card-bg overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
