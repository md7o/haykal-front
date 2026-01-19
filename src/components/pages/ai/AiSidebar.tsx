"use client";

import { useRouter } from "next/navigation";
import {
  LucideIcon,
  MessageSquare,
  BookOpen,
  CalendarDays,
  BarChartHorizontal,
  Settings,
  User,
  Users,
  Plus,
  Menu,
  Edit,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui-tools/ui/sidebar";
import { Button } from "@/components/ui-tools/ui/button";

export type AiNavKey = "feed" | "posts" | "resources" | "events" | "communication" | "settings" | "manage-members";

interface MenuItem {
  id: AiNavKey;
  label: string;
  icon: LucideIcon;
}

interface AiSidebarProps {
  activeItem: AiNavKey;
  slug: string;
  onSettingsOpen?: () => void;
  isOwner?: boolean;
}

// menu items removed per request

export default function AiSidebar({ slug, onSettingsOpen }: AiSidebarProps) {
  const router = useRouter();

  const buttonClass =
    "rounded-base hover:bg-accent/10 transition-all text-description  group/icon flex items-center gap-3 px-3 py-4 w-full text-left";

  const recentChats = [
    { id: "1", name: "Project Architecture", timestamp: "2 hours ago" },
    { id: "2", name: "API Design Discussion", timestamp: "1 day ago" },
    { id: "3", name: "Database Optimization", timestamp: "3 days ago" },
  ];

  return (
    <Sidebar collapsible="offcanvas">
      {/* Header with Trigger and Create Button */}
      <SidebarHeader className="flex flex-row items-center justify-between gap-2 p-4">
        <h1 className="text-lg font-bold text-title flex-1">AI Studio</h1>
        <SidebarTrigger className="h-6 w-6" />
      </SidebarHeader>

      <SidebarContent className="flex flex-col items-start">
        <Button variant="outline" onClick={() => {}}>
          <Edit size={30} />
          <span>New Chat</span>
        </Button>
        {/* Recent Chats Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-description text-xs">Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentChats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton asChild className={buttonClass}>
                    <button
                      type="button"
                      onClick={() => router.push(`/ai/${slug}/chat/${chat.id}`)}
                      className="flex items-center gap-3 px-3 py-4 w-full text-left cursor-pointer hover:bg-accent/10 rounded-base transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 text-title" />
                      <span className="text-sm text-title truncate">{chat.name}</span>
                      <span className="text-xs text-description">{chat.timestamp}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
