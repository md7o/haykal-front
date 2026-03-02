"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogHeader, DialogTitle } from "../shadcn_ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../shadcn_ui/tabs";
import { Spinner } from "../shadcn_ui/spinner";

import { Users, Briefcase, ExternalLink, Globe } from "lucide-react";
import { communityDataType, getCommunityDataById } from "@/lib/api/community-api/communityData-endpoints";
import { getMembershipsByUser } from "@/lib/api/community-api/membership-endpoints";

export const RECENT_PORTFOLIOS_KEY = "recentPortfolios";

export type RecentPortfolio = {
  id: string;
  slug: string;
  visitedAt: string;
};

export function recordPortfolioVisit(portfolio: { id: string; slug: string }) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(RECENT_PORTFOLIOS_KEY);
    const existing: RecentPortfolio[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((p) => p.id !== portfolio.id);
    const updated = [{ ...portfolio, visitedAt: new Date().toISOString() }, ...filtered].slice(0, 10);
    localStorage.setItem(RECENT_PORTFOLIOS_KEY, JSON.stringify(updated));
  } catch {
    /* ignore */
  }
}

function getRecentPortfolios(): RecentPortfolio[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_PORTFOLIOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

interface ActivityDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ActivityDialog({ open, onOpenChange }: ActivityDialogProps) {
  const [communities, setCommunities] = useState<communityDataType[]>([]);
  const [recentPortfolios, setRecentPortfolios] = useState<RecentPortfolio[]>([]);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(false);

  const isControlled = typeof open === "boolean" && typeof onOpenChange === "function";
  const dialogProps = isControlled ? { open: Boolean(open), onOpenChange } : {};

  useEffect(() => {
    if (!open) return;

    // Load recent portfolios from localStorage
    setRecentPortfolios(getRecentPortfolios());

    // Fetch user's communities
    const fetchCommunities = async () => {
      setIsLoadingCommunities(true);
      try {
        const memberships = await getMembershipsByUser();
        const communityData = await Promise.allSettled(memberships.map((m) => getCommunityDataById(m.communityId)));
        const resolved = communityData
          .filter((r): r is PromiseFulfilledResult<communityDataType> => r.status === "fulfilled")
          .map((r) => r.value);
        setCommunities(resolved);
      } catch {
        setCommunities([]);
      } finally {
        setIsLoadingCommunities(false);
      }
    };

    fetchCommunities();
  }, [open]);

  return (
    <Dialog {...(dialogProps as any)}>
      <DialogContent className="sm:max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden rounded-soft">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold text-title">My Activity</DialogTitle>
          <p className="text-sm text-description mt-1">Your communities and recently visited portfolios</p>
        </DialogHeader>

        <Tabs defaultValue="communities" className="flex-1 flex flex-col overflow-hidden px-6 pb-6">
          <TabsList className="mb-4 bg-card-main rounded-soft ">
            <TabsTrigger
              value="communities"
              className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-accent  text-description transition-all"
            >
              <Users size={14} /> Communities
            </TabsTrigger>
            <TabsTrigger
              value="portfolios"
              className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-accent  text-description transition-all"
            >
              <Briefcase size={14} /> Recent Portfolios
            </TabsTrigger>
          </TabsList>

          {/* Communities Tab */}
          <TabsContent value="communities" className="flex-1 overflow-y-auto">
            {isLoadingCommunities ? (
              <div className="flex justify-center items-center py-16">
                <Spinner className="size-8 text-accent" />
              </div>
            ) : communities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="size-12 rounded-soft bg-card-main flex items-center justify-center">
                  <Users size={22} className="text-description" />
                </div>
                <p className="text-description text-sm">You haven&apos;t joined any communities yet.</p>
                <Link href="/community" className="text-sm font-medium text-accent hover:opacity-70 transition-opacity">
                  Explore communities →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {communities.map((community) => (
                  <Link
                    key={community.id}
                    href={`/community/${community.slug}`}
                    onClick={() => onOpenChange?.(false)}
                    className="group flex items-center gap-3 p-3 rounded-soft bg-card-main hover:bg-secondary-card transition-colors"
                  >
                    <div className="size-10 rounded-soft bg-card-main flex items-center justify-center shrink-0 overflow-hidden">
                      {community.logoUrl ? (
                        <Image
                          src={community.logoUrl}
                          alt={community.logoTitle ?? community.slug}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Globe size={18} className="text-description" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-title truncate capitalize">{community.slug}</p>
                      {community.description && <p className="text-xs text-description truncate">{community.description}</p>}
                      {community.type && (
                        <span className="inline-block text-[10px] font-medium text-accent capitalize mt-0.5">
                          {community.type}
                        </span>
                      )}
                    </div>
                    <ExternalLink
                      size={14}
                      className="text-description opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    />
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Recent Portfolios Tab */}
          <TabsContent value="portfolios" className="flex-1 overflow-y-auto ">
            {recentPortfolios.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="size-12 rounded-soft bg-card-main flex items-center justify-center">
                  <Briefcase size={22} className="text-description" />
                </div>
                <p className="text-description text-sm">No recently visited portfolios.</p>
                <Link href="/" className="text-sm font-medium text-accent hover:opacity-70 transition-opacity">
                  Explore portfolios →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ">
                {recentPortfolios.map((portfolio) => (
                  <Link
                    key={portfolio.id}
                    href={`/portfolio/${portfolio.id}`}
                    onClick={() => onOpenChange?.(false)}
                    className="group flex items-center gap-3 p-3 rounded-soft bg-card-main hover:bg-secondary-card transition-colors "
                  >
                    <div className="size-10 rounded-soft bg-card-main flex items-center justify-center shrink-0">
                      <Briefcase size={18} className="text-description" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-title truncate">@{portfolio.slug}</p>
                      <p className="text-xs text-description">
                        {new Date(portfolio.visitedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <ExternalLink
                      size={14}
                      className="text-description opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    />
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
