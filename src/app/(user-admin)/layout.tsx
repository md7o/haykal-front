import { SidebarProvider } from "@/components/ui-tools/ui/sidebar";
import { StudioProvider } from "@/context/StudioContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <StudioProvider>{children}</StudioProvider>
    </SidebarProvider>
  );
}
