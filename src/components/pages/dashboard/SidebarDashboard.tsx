"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Layers, BarChart2, User, LogOut, LucideIcon, Eye, Users2, Edit } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
}

interface MenuGroup {
  id: string;
  label?: string;
  items: MenuItem[];
}
export default function SidebarDashboard() {
  const { logoutUser, user } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/";
    } catch (e) {
      window.location.href = "/";
    }
  };

  const menuGroups: MenuGroup[] = [
    {
      id: "portfolio",
      label: "Portfolio",
      items: [
        {
          id: "sections",
          label: "Sections",
          icon: Layers,
          href: "/dashboard/sections",
        },
        {
          id: "preview",
          label: "Preview",
          icon: Eye,
          href: "/dashboard/preview",
        },
        {
          id: "edit",
          label: "Edit",
          icon: Edit,
          href: "/studio?mode=edit",
        },
      ],
    },
    {
      id: "insights",
      label: "Analystics",
      items: [
        {
          id: "insights",
          label: "Insights",
          icon: BarChart2,
          href: "/dashboard/insights",
        },
      ],
    },
  ];

  const footerItems: MenuItem[] = [
    {
      id: "account",
      label: "Account",
      icon: User,
      href: "/user-admin/account",
    },
    {
      id: "logout",
      label: "Logout",
      icon: LogOut,
      onClick: handleLogout,
    },
  ];

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    // derive active via pathname matching end segment

    const buttonClasses = "rounded-base hover:bg-accent/10 py-5 transition-all text-description hover:text-accent group/icon";

    const iconContainerClasses = "w-8 h-8 rounded-soft flex items-center justify-center";

    const isActive = !!(item.href && pathname?.startsWith(item.href));

    const iconClasses = `w-5 h-5 transition-colors group-hover/icon:text-accent ${isActive ? "text-accent" : "text-title"}`;

    const baseInner = (
      <>
        <div className={iconContainerClasses}>
          <Icon className={iconClasses} />
        </div>
        <span className={`font-medium ${isActive ? "text-accent" : ""}`}>{item.label}</span>
      </>
    );

    if (item.href) {
      return (
        <SidebarMenuButton key={item.id} asChild className={buttonClasses}>
          <a href={item.href} className={`flex items-center gap-3  px-3 py-5 w-full text-left ${isActive ? "bg-accent/10" : ""}`}>
            {baseInner}
          </a>
        </SidebarMenuButton>
      );
    }

    if (item.onClick) {
      return (
        <SidebarMenuButton key={item.id} asChild className={buttonClasses}>
          <button
            type="button"
            onClick={item.onClick}
            className={`flex items-center gap-3 px-3 py-5 w-full text-left cursor-pointer ${isActive ? "bg-accent/10" : ""}`}
          >
            {baseInner}
          </button>
        </SidebarMenuButton>
      );
    }

    return null;
  };

  return (
    <Sidebar className="bg-white shadow-md" collapsible="offcanvas">
      <SidebarContent className="p-4">
        <SidebarHeader className="text-xl ">Welcome {user?.username}</SidebarHeader>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.id} className={group.id === "portfolio" ? "border-b border-card-border/20" : ""}>
            {group.label && <SidebarGroupLabel className="text-description text-xs">{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>{renderMenuItem(item)}</SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarFooter className="mt-auto">
          <p className="text-description text-xs">Settings</p>
          <SidebarMenu className="space-y-2">
            {footerItems.map((item) => (
              <SidebarMenuItem key={item.id}>{renderMenuItem(item)}</SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
