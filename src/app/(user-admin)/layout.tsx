import { SidebarProvider } from "@/components/ui-tools/ui/sidebar";
import { StudioProvider } from "@/context/studio-context-logic/StudioContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <StudioProvider>{children}</StudioProvider>
    </SidebarProvider>
  );
}
