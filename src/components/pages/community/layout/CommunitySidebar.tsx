"use client";

import { useRouter } from "next/navigation";
import { LucideIcon, MessageSquare, BookOpen, CalendarDays, BarChartHorizontal, Settings, User, Users } from "lucide-react";
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
} from "@/components/ui/shadcn_ui/sidebar";

export type CommunityNavKey = "feed" | "posts" | "resources" | "events" | "communication" | "settings" | "manage-members";

interface MenuItem {
  id: CommunityNavKey;
  label: string;
  icon: LucideIcon;
}

interface CommunitySidebarProps {
  title?: string;
  activeItem: CommunityNavKey;
  slug: string;
  onSettingsOpen?: () => void;
  isOwner?: boolean;
}

const primaryItems: MenuItem[] = [
  { id: "feed", label: "Feed", icon: BarChartHorizontal },
  { id: "posts", label: "Posts", icon: MessageSquare },
  { id: "resources", label: "Resources", icon: BookOpen },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "communication", label: "Communication", icon: MessageSquare },
];

export default function CommunitySidebar({
  title = "Community",
  activeItem,
  slug,
  onSettingsOpen,
  isOwner = false,
}: CommunitySidebarProps) {
  const router = useRouter();

  const displayTitle = title.replace(/^Community:\s*/i, "");

  const buttonClass =
    "rounded-base hover:bg-accent/10 transition-all text-description  group/icon flex items-center gap-3 px-3 py-4 w-full text-left";

  const ownerFooterItem: MenuItem = { id: "manage-members", label: "Manage Members", icon: Users };
  const settingsItem: MenuItem = { id: "settings", label: "Settings", icon: Settings };
  const dynamicFooterItems: MenuItem[] = isOwner ? [ownerFooterItem, settingsItem] : [];

  const handleNavigate = (item: MenuItem) => {
    if (item.id === "settings") {
      onSettingsOpen?.();
    } else {
      router.push(`/community/${slug}/${item.id}`);
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = activeItem === item.id;
    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton asChild className={buttonClass}>
          <button
            type="button"
            onClick={() => handleNavigate(item)}
            className={`flex items-center gap-3 px-3 py-6 w-full text-left cursor-pointer ${isActive ? "bg-accent/10 " : ""}`}
          >
            <div className="w-8 h-8 rounded-soft flex items-center justify-center">
              <Icon className={`w-5 h-5  transition-colors ${isActive ? "text-accent" : "text-title "}`} />
            </div>
            <span className={`${isActive ? " text-accent" : "text-title"}`}>{item.label}</span>
          </button>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="bg-card-main shadow-md" collapsible="offcanvas">
      <SidebarContent className="py-4 px-2 h-full flex flex-col">
        <SidebarHeader className="text-2xl font-semibold px-4 text-title">{displayTitle}</SidebarHeader>

        <div className="flex-1 flex flex-col">
          <SidebarGroup>
            <SidebarGroupLabel className="text-description text-xs">Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{primaryItems.map(renderMenuItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <div className="flex-1" aria-hidden />
        </div>

        <SidebarGroup className="pt-2 border-t border-white/20">
          <SidebarGroupLabel className="text-description text-xs">Profile</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{dynamicFooterItems.map(renderMenuItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
