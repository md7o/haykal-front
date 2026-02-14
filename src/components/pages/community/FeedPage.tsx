"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommunityItemTypeEnum,
  getCommunityItemsByCommunity,
  type CommunityItemType,
} from "@/api/community-api/community-items-endpoints";
import { useCommunityData } from "@/context/CommunityContext";
import { CalendarClock, FolderOpen, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui-tools/ui/button";

type FeedData = {
  posts: CommunityItemType[];
  events: CommunityItemType[];
  resources: CommunityItemType[];
};

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
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FeedData>({ posts: [], events: [], resources: [] });
  const { communityData } = useCommunityData();
  const router = useRouter();

  const CACHE_KEY = "feedPageCache";
  const CACHE_TTL = 30 * 60 * 1000;

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!communityData?.id) {
        setLoading(false);
        return;
      }
      try {
        const now = Date.now();
        const cached = sessionStorage.getItem(CACHE_KEY);
        const parsed = cached ? JSON.parse(cached) : null;

        if (parsed && now - parsed.timestamp < CACHE_TTL) {
          if (!alive) return;
          setData(parsed.data);
          setLoading(false);
          return;
        }

        setLoading(true);
        const [posts, events, resources] = await Promise.all([
          getCommunityItemsByCommunity(communityData.id, CommunityItemTypeEnum.POST),
          getCommunityItemsByCommunity(communityData.id, CommunityItemTypeEnum.EVENT),
          getCommunityItemsByCommunity(communityData.id, CommunityItemTypeEnum.RESOURCE),
        ]);

        if (!alive) return;

        const getLatest3 = (items: CommunityItemType[]) =>
          [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

        const newData = {
          posts: getLatest3(posts),
          events: getLatest3(events),
          resources: getLatest3(resources),
        };

        setData(newData);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: newData, timestamp: now }));
      } catch {
        if (!alive) return;
        setData({ posts: [], events: [], resources: [] });
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [communityData?.id]);

  const sections = [
    { key: "posts", label: "Posts", items: data.posts, icon: <MessageCircle /> },
    { key: "events", label: "Events", items: data.events, icon: <CalendarClock /> },
    { key: "resources", label: "Resources", items: data.resources, icon: <FolderOpen /> },
  ];

  const communityName = communityData?.slug || "the community";
  const communityDescription = communityData?.description || "Welcome to the community feed page.";

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <section className="rounded-base overflow-hidden">
        <div
          className="h-70 bg-cover bg-center backdrop-blur-[40px] backdrop-brightness-60"
          style={{ backgroundImage: "url('/assets/images/ArtBackground.jpg')" }}
        >
          <div className="flex flex-col justify-center items-center rounded-base p-6 bg-cover bg-center h-70 backdrop-blur-[40px] backdrop-brightness-60">
            <h1 className="text-4xl font-bold text-white">Welcome to {communityName}</h1>
            <p className="text-xl text-white/90 mt-2">{communityDescription}</p>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {loading ? (
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
