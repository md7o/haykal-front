"use client";

import { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/shadcn_ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/shadcn_ui/card";
import { Skeleton } from "@/components/ui/shadcn_ui/skeleton";
import { FileText, Layers, LayoutDashboard, Users } from "lucide-react";
import { getAllPortfolios, type Portfolio } from "@/lib/api/portfolios-api/portfolio-endpoints";
import { getPages, type Page } from "@/lib/api/portfolios-api/pages-endpoints";
import { getSections, type Section } from "@/lib/api/portfolios-api/sections-endpoints";
import { getMembershipsByUser, type membershipType } from "@/lib/api/community-api/membership-endpoints";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLast12Months(): { year: number; month: number; label: string }[] {
  const result = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    });
  }
  return result;
}

// ─── Chart configs ─────────────────────────────────────────────────────────────

const timelineConfig: ChartConfig = {
  portfolios: { label: "Portfolios", color: "#fa886b" },
  communities: { label: "Communities", color: "#30c97d" },
};

const pagesConfig: ChartConfig = {
  pages: { label: "Pages", color: "#fa886b" },
};

const sectionsConfig: ChartConfig = {
  count: { label: "Sections", color: "#30c97d" },
};

const membershipConfig: ChartConfig = {
  owner: { label: "Owner", color: "#fa886b" },
  member: { label: "Member", color: "#30c97d" },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [memberships, setMemberships] = useState<membershipType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [portfoliosData, membershipsData] = await Promise.all([getAllPortfolios(), getMembershipsByUser()]);
        setPortfolios(portfoliosData);
        setMemberships(membershipsData);

        if (portfoliosData.length > 0) {
          const pagesResults = await Promise.all(portfoliosData.map((p) => getPages(p.id)));
          const allPages = pagesResults.flat();
          setPages(allPages);

          if (allPages.length > 0 && allPages.length <= 20) {
            try {
              const sectionsResults = await Promise.allSettled(allPages.map((pg) => getSections(pg.id)));
              const flat = sectionsResults.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
              setSections(flat);
            } catch {
              // sections are optional — skip on error
            }
          }
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ─── Derived data ──────────────────────────────────────────────────────────

  const timelineData = useMemo(() => {
    return getLast12Months().map(({ year, month, label }) => ({
      month: label,
      portfolios: portfolios.filter((p) => {
        if (!p.createdAt) return false;
        const d = new Date(p.createdAt);
        return d.getFullYear() === year && d.getMonth() === month;
      }).length,
      communities: memberships.filter((m) => {
        if (!m.joinedAt) return false;
        const d = new Date(m.joinedAt);
        return d.getFullYear() === year && d.getMonth() === month;
      }).length,
    }));
  }, [portfolios, memberships]);

  const pagesPerPortfolio = useMemo(() => {
    return portfolios
      .map((p) => ({
        name: p.slug.length > 14 ? p.slug.slice(0, 14) + "\u2026" : p.slug,
        pages: pages.filter((pg) => pg.portfolioId === p.id).length,
      }))
      .sort((a, b) => b.pages - a.pages)
      .slice(0, 8);
  }, [portfolios, pages]);

  const sectionTypesData = useMemo(() => {
    const counts: Record<string, number> = {};
    sections.forEach((s) => {
      const label = s.type.replace(/-/g, " ");
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [sections]);

  const membershipPieData = useMemo(
    () => [
      { name: "owner", value: memberships.filter((m) => m.role === "owner").length },
      { name: "member", value: memberships.filter((m) => m.role === "member").length },
    ],
    [memberships],
  );

  const kpis = [
    { label: "Portfolios", value: portfolios.length, icon: FileText },
    { label: "Pages", value: pages.length, icon: Layers },
    { label: "Sections", value: sections.length, icon: LayoutDashboard },
    { label: "Communities", value: memberships.length, icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-title">Analytics</h1>
        <p className="text-description text-sm mt-1">Overview of your portfolios and community activity</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="bg-card-bg rounded-base border-0 shadow-none py-5">
            <CardHeader className="flex flex-row items-center justify-between px-5 py-0 mb-3">
              <CardTitle className="text-description text-sm font-medium">{kpi.label}</CardTitle>
              <div className="bg-accent/10 p-2 rounded-soft">
                <kpi.icon className="size-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent className="px-5 py-0">
              {isLoading ? (
                <Skeleton className="h-7 w-16 rounded-soft bg-card-main" />
              ) : (
                <p className="text-2xl font-bold text-title">{kpi.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Timeline — AreaChart */}
      <Card className="bg-card-bg rounded-base border-0 shadow-none">
        <CardHeader className="px-5 pt-5 pb-0">
          <CardTitle className="text-title text-base font-semibold">Activity Timeline</CardTitle>
          <CardDescription className="text-description text-sm">
            Portfolios created &amp; communities joined — last 12 months
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pt-4 pb-5">
          {isLoading ? (
            <Skeleton className="h-[280px] w-full rounded-soft bg-card-main" />
          ) : (
            <ChartContainer config={timelineConfig} className="h-[280px] w-full">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-portfolios)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-portfolios)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="communityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-communities)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-communities)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#454545" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: "#cccccc", fontSize: 11 }} tickLine={false} axisLine={false} interval={1} />
                <YAxis tick={{ fill: "#cccccc", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  type="monotone"
                  dataKey="portfolios"
                  stroke="var(--color-portfolios)"
                  strokeWidth={2}
                  fill="url(#portfolioGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="communities"
                  stroke="var(--color-communities)"
                  strokeWidth={2}
                  fill="url(#communityGrad)"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Pages per Portfolio + Section Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pages per Portfolio */}
        <Card className="bg-card-bg rounded-base border-0 shadow-none">
          <CardHeader className="px-5 pt-5 pb-0">
            <CardTitle className="text-title text-base font-semibold">Pages per Portfolio</CardTitle>
            <CardDescription className="text-description text-sm">Number of pages in each portfolio</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pt-4 pb-5">
            {isLoading ? (
              <Skeleton className="h-[240px] w-full rounded-soft bg-card-main" />
            ) : pagesPerPortfolio.length === 0 ? (
              <ChartEmptyState message="No portfolios yet" height={240} />
            ) : (
              <ChartContainer config={pagesConfig} className="h-[240px] w-full">
                <BarChart data={pagesPerPortfolio} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid horizontal={false} stroke="#454545" strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tick={{ fill: "#cccccc", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "#cccccc", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="pages" fill="var(--color-pages)" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Section Types */}
        <Card className="bg-card-bg rounded-base border-0 shadow-none">
          <CardHeader className="px-5 pt-5 pb-0">
            <CardTitle className="text-title text-base font-semibold">Section Types</CardTitle>
            <CardDescription className="text-description text-sm">Most used section types across all pages</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pt-4 pb-5">
            {isLoading ? (
              <Skeleton className="h-[240px] w-full rounded-soft bg-card-main" />
            ) : sectionTypesData.length === 0 ? (
              <ChartEmptyState message="No sections data available" height={240} />
            ) : (
              <ChartContainer config={sectionsConfig} className="h-[240px] w-full">
                <BarChart data={sectionTypesData} margin={{ top: 0, right: 10, left: -20, bottom: 30 }}>
                  <CartesianGrid vertical={false} stroke="#454545" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="type"
                    tick={{ fill: "#cccccc", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    angle={-35}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fill: "#cccccc", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Community breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut — role breakdown */}
        <Card className="bg-card-bg rounded-base border-0 shadow-none">
          <CardHeader className="px-5 pt-5 pb-0">
            <CardTitle className="text-title text-base font-semibold">Community Roles</CardTitle>
            <CardDescription className="text-description text-sm">Owner vs member</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pt-4 pb-5">
            {isLoading ? (
              <Skeleton className="h-[200px] w-full rounded-soft bg-card-main" />
            ) : memberships.length === 0 ? (
              <ChartEmptyState message="Not in any communities" height={200} />
            ) : (
              <ChartContainer config={membershipConfig} className="h-[200px] w-full">
                <PieChart>
                  <Pie
                    data={membershipPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={3}
                  >
                    {membershipPieData.map((entry) => (
                      <Cell key={entry.name} fill={`var(--color-${entry.name})`} strokeWidth={0} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Membership list */}
        <Card className="lg:col-span-2 bg-card-bg rounded-base border-0 shadow-none">
          <CardHeader className="px-5 pt-5 pb-0">
            <CardTitle className="text-title text-base font-semibold">Community Overview</CardTitle>
            <CardDescription className="text-description text-sm">Your memberships</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pt-5 pb-5">
            {isLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-soft bg-card-main" />
                ))}
              </div>
            ) : memberships.length === 0 ? (
              <ChartEmptyState message="Join a community to see it here" height={160} />
            ) : (
              <div className="space-y-3">
                {memberships.slice(0, 5).map((m) => (
                  <div key={m.id} className="flex items-center justify-between bg-card-main rounded-soft px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-title">{m.authorName || m.communityId}</p>
                      <p className="text-xs text-description mt-0.5">
                        Joined{" "}
                        {new Date(m.joinedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        m.role === "owner" ? "bg-accent/15 text-accent" : "bg-success/15 text-success"
                      }`}
                    >
                      {m.role}
                    </span>
                  </div>
                ))}
                {memberships.length > 5 && (
                  <p className="text-xs text-description text-center pt-1">+{memberships.length - 5} more communities</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChartEmptyState({ message, height }: { message: string; height: number }) {
  return (
    <div className="flex items-center justify-center rounded-soft bg-card-main" style={{ height }}>
      <p className="text-description text-sm">{message}</p>
    </div>
  );
}
