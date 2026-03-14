"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarSeparator,
} from "@/components/ui/shadcn_ui/sidebar";
import { FileText, Users, Search, BarChart3, House, Users2 } from "lucide-react";
import { DashboardProvider, useDashboardContext } from "@/lib/context/DashboardContext";

const navItems = [
  { icon: Users2, label: "Users", href: "/dashboard/users" },
  { icon: FileText, label: "Portfolios", href: "/dashboard/portfolio" },
  { icon: Users, label: "Community", href: "/dashboard/community" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
];

const bottomNavItems = [{ icon: House, label: "Home", href: "/" }];

function ShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full ">
        {/* ── Sidebar ── */}
        <Sidebar collapsible="offcanvas" className="bg-card-main">
          {/* Logo */}
          <SidebarHeader className="px-4 py-5">
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
              <Image
                src="/assets/images/Haykal-Logo.png"
                alt="Haykal"
                width={100}
                height={100}
                className="w-12 h-12 shrink-0 object-contain"
              />
              <span className="text-xl text-title group-data-[collapsible=icon]:hidden">Haykal</span>
            </div>
          </SidebarHeader>

          <SidebarSeparator className="bg-light-border mx-3" />

          {/* Main nav */}
          <SidebarContent className="px-2 py-3">
            <SidebarGroup>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.label}
                      size="lg"
                      className={`rounded-soft text-description hover:bg-card-bg hover:text-title transition-colors ${
                        pathname === item.href ? "bg-accent/15 !text-accent font-semibold" : ""
                      }`}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarSeparator className="bg-light-border mx-3" />

          {/* Bottom nav */}
          <SidebarFooter className="px-2 py-3">
            <SidebarMenu>
              {bottomNavItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    size="lg"
                    className="rounded-soft text-description hover:bg-card-bg hover:text-title"
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* ── Main area ── */}
        <SidebarInset className="flex flex-col min-w-0">
          {/* Top header */}
          <header className="sticky top-0 z-30 flex items-center gap-3 bg-base-bg px-4 md:px-6 py-4">
            <SidebarTrigger className="text-description hover:text-title shrink-0" />
          </header>

          {/* Page content injected by Next.js layout */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <ShellInner>{children}</ShellInner>
    </DashboardProvider>
  );
}
