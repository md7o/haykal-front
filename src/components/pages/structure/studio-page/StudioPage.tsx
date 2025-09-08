import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import StudioSidebar from "./StudioSidebar";
import DisplayPage from "./DisplayPage";
import { StudioProvider } from "@/context/StudioContext";

export default function StudioPage() {
  return (
    <StudioProvider initial={{ used: [], available: [] }}>
      <SidebarProvider>
        <StudioSidebar />
        <SidebarInset>
          <DisplayPage />
        </SidebarInset>
      </SidebarProvider>
    </StudioProvider>
  );
}
