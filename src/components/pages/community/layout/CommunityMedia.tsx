"use client";

import { JSX, useState, useEffect } from "react";

import CommunityLayout from "./CommunityLayout";
import { CommunityNavKey } from "./CommunitySidebar";
import EventsPage from "../pages/EventsPage";
import FeedPage from "../pages/FeedPage";
import PostsPage from "../PostsPage";
import ResourcesPage from "../pages/ResourcesPage";
import SettingsDialog from "../options-resources/SettingsDialog";
import { getCommunityDataBySlug } from "@/lib/api/community-api/communityData-endpoints";
import { communityDataType } from "@/lib/api/community-api/communityData-endpoints";
import CommunicationPage from "../pages/CommunicationPage";

interface CommunityMediaProps {
  slug: string;
}

export default function CommunityMedia({ slug }: CommunityMediaProps) {
  const [activeSection] = useState<CommunityNavKey>("feed");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [communityData, setCommunityData] = useState<communityDataType | null>(null);
  const communityTitle = slug ? `Community: ${slug}` : "Community";

  useEffect(() => {
    const loadCommunity = async () => {
      try {
        const data = await getCommunityDataBySlug(slug);
        setCommunityData(data);
      } catch (err) {
        console.error("Failed to load community data:", err);
      }
    };

    loadCommunity();
  }, [slug]);

  const sectionComponents: Record<CommunityNavKey, JSX.Element> = {
    feed: <FeedPage />,
    posts: <PostsPage />,
    resources: <ResourcesPage />,
    events: <EventsPage />,
    communication: <CommunicationPage />,
    settings: <div />,
    "manage-members": <div />, // Manage members is now a separate route
  };

  return (
    <CommunityLayout
      communityTitle={communityTitle}
      activeItem={activeSection}
      slug={slug}
      onSettingsOpen={() => setIsSettingsOpen(true)}
    >
      {sectionComponents[activeSection]}
      {communityData && (
        <SettingsDialog
          communityId={communityData.id}
          slug={communityData.slug}
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          onSettingsUpdate={setCommunityData}
        />
      )}
    </CommunityLayout>
  );
}
