"use client";

import { ReactNode, useState, use, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui-tools/ui/sidebar";
import CommunitySidebar, { CommunityNavKey } from "@/components/pages/community/layout/CommunitySidebar";
import SettingsDialog from "@/components/pages/community/options-resources/SettingsDialog";
import { CommunityProvider, useCommunityData } from "@/context/CommunityContext";
import { useAuth } from "@/context/AuthContext";
import { getMembershipsByUser } from "@/api/community/membership-endpoints";

interface CommunityLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

function CommunityLayoutContent({ children, slug }: { children: ReactNode; slug: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const { communityData, updateCommunityData } = useCommunityData();
  const { user } = useAuth();
  const redirectedRef = useRef(false);

  const isJoinRoute = pathname.includes(`/community/${slug}/join`);

  // Gate community pages behind membership (except /join)
  useEffect(() => {
    const checkMembershipAccess = async () => {
      if (!slug || isJoinRoute || redirectedRef.current) return;

      // If the user isn't logged in, force them to the join page first.
      if (!user) {
        redirectedRef.current = true;
        router.replace(`/community/${slug}/join`);
        return;
      }

      if (!communityData?.id) {
        return;
      }

      try {
        const memberships = await getMembershipsByUser();
        const hasMembership = memberships.some((m) => m.communityId === communityData.id);
        if (!hasMembership) {
          redirectedRef.current = true;
          router.replace(`/community/${slug}/join`);
        }
      } catch {
        // If memberships cannot be loaded, treat as not a member.
        redirectedRef.current = true;
        router.replace(`/community/${slug}/join`);
      }
    };

    void checkMembershipAccess();
  }, [slug, isJoinRoute, user, communityData?.id, router]);

  // Check if current user is owner
  useEffect(() => {
    const checkOwnerStatus = async () => {
      if (!user || !slug || !communityData?.id) {
        setIsOwner(false);
        return;
      }

      try {
        const memberships = await getMembershipsByUser();
        const currentCommunityMembership = memberships.find((m) => m.communityId === communityData.id);
        const isOwnerStatus = currentCommunityMembership?.role === "owner" || false;
        console.log(
          `[Owner Check] User: ${user.userId}, Community: ${communityData.id}, Role: ${currentCommunityMembership?.role}, isOwner: ${isOwnerStatus}`
        );
        setIsOwner(isOwnerStatus);
      } catch (err) {
        console.error("Failed to check owner status:", err);
        setIsOwner(false);
      }
    };

    checkOwnerStatus();
  }, [user, slug, communityData?.id]);

  // Determine active section from URL
  const getActiveSection = (): CommunityNavKey => {
    if (pathname.includes("/feed")) return "feed";
    if (pathname.includes("/posts")) return "posts";
    if (pathname.includes("/resources")) return "resources";
    if (pathname.includes("/events")) return "events";
    if (pathname.includes("/communication")) return "communication";
    if (pathname.includes("/manage-members")) return "manage-members";
    return "feed";
  };

  const activeSection = getActiveSection();
  const communityTitle = slug ? `Community: ${slug}` : "Community";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full text-title">
        <CommunitySidebar
          title={communityTitle}
          activeItem={activeSection}
          slug={slug}
          onSettingsOpen={() => setIsSettingsOpen(true)}
          isOwner={isOwner}
        />
        <SidebarInset className="flex-1 bg-card-bg">
          <div className="flex h-full flex-col gap-4 p-4 md:p-6">
            <div className="md:hidden">
              <SidebarTrigger className="bg-card-main  rounded-base shadow-sm text-title" />
            </div>
            <main
              className={`bg-card-main rounded-base shadow-sm flex-1 ${getActiveSection() === "manage-members" ? "p-0" : "p-6"}`}
            >
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>

      {communityData && (
        <SettingsDialog
          communityId={communityData.id}
          slug={communityData.slug}
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          onSettingsUpdate={updateCommunityData}
        />
      )}
    </SidebarProvider>
  );
}

export default function CommunityLayout({ children, params }: CommunityLayoutProps) {
  const { slug } = use(params);

  return (
    <CommunityProvider slug={slug}>
      <CommunityLayoutContent slug={slug}>{children}</CommunityLayoutContent>
    </CommunityProvider>
  );
}
