"use client";

import { ReactNode } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui-tools/ui/sidebar";
import CommunitySidebar, { CommunityNavKey } from "./CommunitySidebar";

interface CommunityLayoutProps {
  communityTitle?: string;
  activeItem: CommunityNavKey;
  onNavigate: (key: CommunityNavKey) => void;
  children: ReactNode;
}

export default function CommunityLayout({
  communityTitle = "Community",
  activeItem,
  onNavigate,
  children,
}: CommunityLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full text-title">
        <CommunitySidebar title={communityTitle} activeItem={activeItem} onNavigate={onNavigate} />
        <SidebarInset className="flex-1 bg-card-bg">
          <div className="flex h-full flex-col gap-4 p-4 md:p-6">
            <div className="md:hidden">
              <SidebarTrigger className="bg-white border border-card-border/20 rounded-base shadow-sm text-title" />
            </div>
            <main className="bg-white border border-card-border/20 rounded-base shadow-sm flex-1 p-6">{children}</main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
