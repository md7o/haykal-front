"use client";

import { LucideIcon, MessageSquare, BookOpen, CalendarDays, BarChartHorizontal, Settings, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui-tools/ui/sidebar";

export type CommunityNavKey = "posts" | "resources" | "events" | "polls" | "settings" | "account";

interface MenuItem {
  id: CommunityNavKey;
  label: string;
  icon: LucideIcon;
}

interface CommunitySidebarProps {
  title?: string;
  activeItem: CommunityNavKey;
  onNavigate: (key: CommunityNavKey) => void;
}

const primaryItems: MenuItem[] = [
  { id: "posts", label: "Posts", icon: MessageSquare },
  { id: "resources", label: "Resources", icon: BookOpen },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "polls", label: "Polls", icon: BarChartHorizontal },
];

const footerItems: MenuItem[] = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "account", label: "Account", icon: User },
];

export default function CommunitySidebar({ title = "Community", activeItem, onNavigate }: CommunitySidebarProps) {
  const buttonClass =
    "rounded-base hover:bg-accent/10 transition-all text-description  group/icon flex items-center gap-3 px-3 py-4 w-full text-left";

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = activeItem === item.id;
    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton asChild className={buttonClass}>
          <button
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-3 px-3 py-6 w-full text-left cursor-pointer ${isActive ? "bg-accent/10 " : ""}`}
          >
            <div className="w-8 h-8 rounded-soft flex items-center justify-center">
              <Icon className={`w-5 h-5  transition-colors ${isActive ? "text-accent" : "text-title "}`} />
            </div>
            <span className={`${isActive ? " text-accent" : ""}`}>{item.label}</span>
          </button>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="bg-white shadow-md" collapsible="offcanvas">
      <SidebarContent className="py-4 px-2 h-full flex flex-col">
        <SidebarHeader className="text-xl text-title pb-1">{title}</SidebarHeader>

        <div className="flex-1 flex flex-col">
          <SidebarGroup>
            <SidebarGroupLabel className="text-description text-xs">Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{primaryItems.map(renderMenuItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <div className="flex-1" aria-hidden />
        </div>

        <SidebarGroup className="pt-2 border-t border-card-border/20">
          <SidebarGroupLabel className="text-description text-xs">Profile</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{footerItems.map(renderMenuItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter className="text-description text-xs">Stay engaged</SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
