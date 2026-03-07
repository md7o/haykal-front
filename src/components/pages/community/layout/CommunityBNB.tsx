import BottomNavigationBar from "@/components/layouts/BottomNavigationBar";
import { House, Menu } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/shadcn_ui/sidebar";

interface CommunityBNBProps {
  slug: string;
}

export default function CommunityBNB({ slug }: CommunityBNBProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  const isFeedActive = pathname.includes("/feed");

  return (
    <BottomNavigationBar
      buttons={[
        {
          icon: <House />,
          label: "Feed",
          isActive: isFeedActive,
          onClick: () => {
            router.push(`/community/${slug}/feed`);
          },
        },
        {
          icon: <Menu />,
          label: "Menu",
          isActive: false,
          onClick: () => {
            toggleSidebar();
          },
        },
      ]}
    />
  );
}
