import { useEffect, useState } from "react";
import {
  getCommunityItemsByCommunity,
  CommunityItemTypeEnum,
  type CommunityItemType,
} from "@/lib/api/community-api/community-items-endpoints";

export type FeedData = {
  posts: CommunityItemType[];
  events: CommunityItemType[];
  resources: CommunityItemType[];
};

const CACHE_KEY_PREFIX = "feedPageCache";
const CACHE_TTL_MS = 30 * 60 * 1000;

const getLatest3 = (items: CommunityItemType[]) =>
  [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

export function useFeedData(communityId: string | undefined) {
  const [data, setData] = useState<FeedData>({ posts: [], events: [], resources: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!communityId) {
      setIsLoading(false);
      return;
    }

    let alive = true;

    (async () => {
      try {
        const cacheKey = `${CACHE_KEY_PREFIX}:${communityId}`;
        const cached = sessionStorage.getItem(cacheKey);
        const parsed = cached ? JSON.parse(cached) : null;

        if (parsed && Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          if (alive) {
            setData(parsed.data);
            setIsLoading(false);
          }
          return;
        }

        setIsLoading(true);
        const [posts, events, resources] = await Promise.all([
          getCommunityItemsByCommunity(communityId, CommunityItemTypeEnum.POST),
          getCommunityItemsByCommunity(communityId, CommunityItemTypeEnum.EVENT),
          getCommunityItemsByCommunity(communityId, CommunityItemTypeEnum.RESOURCE),
        ]);

        if (!alive) return;

        const newData: FeedData = {
          posts: getLatest3(posts),
          events: getLatest3(events),
          resources: getLatest3(resources),
        };

        setData(newData);
        sessionStorage.setItem(cacheKey, JSON.stringify({ data: newData, timestamp: Date.now() }));
      } catch {
        if (alive) setData({ posts: [], events: [], resources: [] });
      } finally {
        if (alive) setIsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [communityId]);

  return { data, isLoading };
}
