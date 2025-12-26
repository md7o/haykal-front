"use client";

import { useState } from "react";
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
} from "@/components/ui-tools/ui/sidebar";
import { BarChart2, User, LogOut, LucideIcon, Eye, Edit, Trash2, QrCode } from "lucide-react";
import { useStudio } from "@/context/studio-context-logic/StudioContext";
import { useUserPortfolio } from "@/context/UserPortfolioContext";
import { deletePortfolio } from "@/api/portfolio-endpoints";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PagesDialog from "@/components/ui-tools/custom_ui/DialogStorage";
import { resolveUserPortfolioId } from "@/lib/portfolio-helpers";
import ShareButton from "@/components/ui-tools/custom_ui/ShareButton";

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
}
export default function SidebarDashboard() {
  const { logoutUser, user } = useAuth();
  const { portfolioId } = useStudio();
  const { refreshPortfolioId } = useUserPortfolio();
  const pathname = usePathname();
  const router = useRouter();
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleLogout = () =>
    logoutUser()
      .then(() => router.push("/"))
      .catch(() => router.push("/"));

  const getPortfolioId = async () => {
    if (portfolioId) return portfolioId;
    if (typeof window !== "undefined") {
      const id = sessionStorage.getItem("portfolioId") || sessionStorage.getItem("customDesignId");
      if (id) return id;
    }
    if (user) {
      try {
        const userId = (user as any).userId || (user as any).id;
        if (userId) return await resolveUserPortfolioId(String(userId));
      } catch {}
    }
    return null;
  };

  const handleRemovePortfolio = async () => {
    const idToRemove = await getPortfolioId();
    if (!idToRemove) {
      window.alert("No portfolio selected to remove.");
      return;
    }
    setIsRemoving(true);
    try {
      if (await deletePortfolio(idToRemove)) {
        await refreshPortfolioId();
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("portfolioId");
          sessionStorage.removeItem("customDesignId");
          document.cookie = "portfolio_removed=true; path=/; max-age=10";
        }
        router.push("/");
      } else {
        window.alert("Failed to remove portfolio.");
      }
    } catch {
      window.alert("Failed to remove portfolio.");
    } finally {
      setIsRemoving(false);
      setShowRemoveDialog(false);
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = !!(item.href && pathname?.startsWith(item.href));
    const btnClass = "rounded-base hover:bg-accent/10 py-5 transition-all text-description hover:text-accent group/icon";
    const inner = (
      <>
        <div className="w-8 h-8 rounded-soft flex items-center justify-center">
          <Icon className={`w-5 h-5 transition-colors group-hover/icon:text-accent ${isActive ? "text-accent" : "text-title"}`} />
        </div>
        <span className={`font-medium ${isActive ? "text-accent" : ""}`}>{item.label}</span>
      </>
    );

    if (item.href)
      return (
        <SidebarMenuButton key={item.id} asChild className={btnClass}>
          <a href={item.href} className={`flex items-center gap-3 px-3 py-5 w-full text-left ${isActive ? "bg-accent/10" : ""}`}>
            {inner}
          </a>
        </SidebarMenuButton>
      );
    if (item.onClick)
      return (
        <SidebarMenuButton key={item.id} asChild className={btnClass}>
          <button
            type="button"
            onClick={item.onClick}
            className={`flex items-center gap-3 px-3 py-5 w-full text-left cursor-pointer ${isActive ? "bg-accent/10" : ""}`}
          >
            {inner}
          </button>
        </SidebarMenuButton>
      );
    return null;
  };

  const menuItems = [
    { id: "preview", label: "Preview", icon: Eye, href: "/dashboard/preview" },
    { id: "edit", label: "Edit", icon: Edit, href: portfolioId ? `/studio?id=${encodeURIComponent(portfolioId)}` : "/studio" },
    { id: "share", label: "Share", icon: QrCode },
    { id: "insights", label: "Insights", icon: BarChart2, href: "/dashboard/insights" },
  ];

  const footerItems = [
    // { id: "account", label: "Account", icon: User, href: "/user-admin/account" },
    { id: "logout", label: "Logout", icon: LogOut, onClick: handleLogout },
    { id: "remove", label: "Remove portfolio", icon: Trash2, onClick: () => setShowRemoveDialog(true) },
  ];

  return (
    <Sidebar className="bg-white shadow-md" collapsible="offcanvas">
      <SidebarContent className="p-4">
        <SidebarHeader className="text-xl">Welcome {user?.username}</SidebarHeader>
        <SidebarGroup className="border-b border-card-border/20">
          <SidebarGroupLabel className="text-description text-xs">Portfolio</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.slice(0, 3).map((item) => (
                <SidebarMenuItem key={item.id}>
                  {item.id === "share" ? (
                    <ShareButton portfolioId={portfolioId || undefined}>
                      <SidebarMenuButton className="cursor-pointer rounded-base hover:bg-accent/10 transition-all text-description hover:text-accent group/icon flex items-center gap-3 px-3 py-5 w-full text-left">
                        <div className="w-8 h-8 rounded-soft flex items-center justify-center">
                          <QrCode className="w-5 h-5 text-title group-hover/icon:text-accent transition-colors" />
                        </div>
                        <span className="font-medium">Share</span>
                      </SidebarMenuButton>
                    </ShareButton>
                  ) : (
                    renderMenuItem(item)
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-description text-xs">Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{menuItems.slice(3).map(renderMenuItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter className="mt-auto">
          <p className="text-description text-xs">Settings</p>
          <SidebarMenu className="space-y-2">{footerItems.map(renderMenuItem)}</SidebarMenu>
        </SidebarFooter>
        <PagesDialog
          title="Confirm Removal"
          content="Are you sure you want to remove this portfolio? This action cannot be undone."
          confirmLabel={isRemoving ? "Removing..." : "Remove"}
          cancelLabel="Cancel"
          open={showRemoveDialog}
          onOpenChange={setShowRemoveDialog}
          onConfirm={handleRemovePortfolio}
          onCancel={() => setShowRemoveDialog(false)}
        />
      </SidebarContent>
    </Sidebar>
  );
}
