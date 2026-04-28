"use client";

import { useRouter } from "next/navigation";
import { CalendarClock, FolderOpen, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/shadcn_ui/button";
import { useCommunityData } from "@/lib/context/CommunityContext";
import { useFeedData } from "@/hooks/useFeedData";
import type { CommunityItemType } from "@/lib/api/community-api/community-items-endpoints";

const PreviewList = ({ items, emptyText }: { items: CommunityItemType[]; emptyText: string }) =>
  items.length === 0 ? (
    <p className="text-description text-sm">{emptyText}</p>
  ) : (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.id} className="bg-card-main rounded-base p-4">
          <p className="text-title font-semibold line-clamp-1">{item.title}</p>
          {item.content && <p className="text-description text-sm mt-1 line-clamp-2">{item.content}</p>}
          <p className="text-description text-xs mt-3 opacity-80">
            {new Date(item.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      ))}
    </div>
  );

export default function FeedPage() {
  const { communityData } = useCommunityData();
  const { data, isLoading } = useFeedData(communityData?.id);
  const router = useRouter();

  const communityName = communityData?.slug || "the community";
  const communityDescription = communityData?.description || "Welcome to the community feed page.";

  const sections = [
    { key: "posts", label: "Posts", items: data.posts, icon: <MessageCircle /> },
    { key: "events", label: "Events", items: data.events, icon: <CalendarClock /> },
    { key: "resources", label: "Resources", items: data.resources, icon: <FolderOpen /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <section className="rounded-base overflow-hidden">
        <div
          className="h-70 bg-cover bg-center backdrop-blur-[40px] backdrop-brightness-60 flex flex-col justify-center items-center rounded-base p-6"
          style={{ backgroundImage: "url('/assets/images/ArtBackground.jpg')" }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center">Welcome to {communityName}</h1>
          <p className="text-lg md:text-xl text-white/90 mt-2 text-center">{communityDescription}</p>
        </div>
      </section>

      {/* Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map(({ key, label, items, icon }) => (
          <div key={key} className="bg-card-bg rounded-base p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h2 className="flex gap-3 items-center text-title text-xl font-semibold">
                  <span className="text-accent">{icon}</span>
                  {label}
                </h2>
                <p className="text-description text-sm mt-1">Last 3 {label.toLowerCase()}</p>
              </div>
              <Button onClick={() => router.push(`/community/${communityData?.slug}/${key}`)}>
                View All <ArrowRight size={16} />
              </Button>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <p className="text-description text-sm">Loading…</p>
              ) : (
                <PreviewList items={items} emptyText={`No ${label.toLowerCase()} yet.`} />
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
