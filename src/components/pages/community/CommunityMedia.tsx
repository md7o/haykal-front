"use client";

import { JSX, useState } from "react";

import CommunityLayout from "./CommunityLayout";
import { CommunityNavKey } from "./CommunitySidebar";
import AccountPage from "./AccountPage";
import EventsPage from "./EventsPage";
import PollsPage from "./PollsPage";
import PostsPage from "./PostsPage";
import ResourcesPage from "./ResourcesPage";
import SettingsPage from "./SettingsPage";

interface CommunityMediaProps {
  slug: string;
}

const sectionComponents: Record<CommunityNavKey, JSX.Element> = {
  posts: <PostsPage />,
  resources: <ResourcesPage />,
  events: <EventsPage />,
  polls: <PollsPage />,
  settings: <SettingsPage />,
  account: <AccountPage />,
};

export default function CommunityMedia({ slug }: CommunityMediaProps) {
  const [activeSection, setActiveSection] = useState<CommunityNavKey>("posts");
  const communityTitle = slug ? `Community: ${slug}` : "Community";

  return (
    <CommunityLayout communityTitle={communityTitle} activeItem={activeSection} onNavigate={setActiveSection}>
      {sectionComponents[activeSection]}
    </CommunityLayout>
  );
}
