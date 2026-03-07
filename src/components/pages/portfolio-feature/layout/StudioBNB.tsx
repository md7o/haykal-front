import BottomNavigationBar from "@/components/layouts/BottomNavigationBar";
import { LayoutTemplate, Palette, Layers } from "lucide-react";
import { useSidebar } from "@/components/ui/shadcn_ui/sidebar";
import { useStudioSidebar } from "./StudioSidebar";

export default function StudioBNB() {
  const { toggleSidebar } = useSidebar();
  const { activeTab, setActiveTab } = useStudioSidebar();

  return (
    <BottomNavigationBar
      buttons={[
        {
          icon: <LayoutTemplate />,
          label: "Sections",
          isActive: activeTab === "sections",
          onClick: () => {
            setActiveTab("sections");
            toggleSidebar();
          },
        },
        {
          icon: <Layers />,
          label: "Pages",
          isActive: activeTab === "pages",
          onClick: () => {
            setActiveTab("pages");
            toggleSidebar();
          },
        },
        {
          icon: <Palette />,
          label: "Theme",
          isActive: activeTab === "assets",
          onClick: () => {
            setActiveTab("assets");
            toggleSidebar();
          },
        },
      ]}
    />
  );
}
