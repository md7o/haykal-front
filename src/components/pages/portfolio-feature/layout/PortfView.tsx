"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, publicApi } from "@/lib/api/auth-api/auth-endpoints";
import { getPortfolioByIDorSlug, type Portfolio } from "@/lib/api/portfolios-api/portfolio-endpoints";
import { recordPortfolioVisit } from "@/components/ui/custom_ui/ActivityDialog";
import type { Page } from "@/lib/api/portfolios-api/pages-endpoints";
import type { Section } from "@/lib/api/portfolios-api/sections-endpoints";
import { sectionsVisualization } from "@/components/pages/portfolio-feature/sections-design/sectionsVisualization";
import { inheritHeaderConfig, isHome, mapSections } from "@/lib/context/hooks/studio-utils";
import { Spinner } from "@/components/ui/shadcn_ui/spinner";
import { applyAssetsToDom } from "@/lib/theme/theme-utils";

type PublicPage = Page & { title?: string | null; sections?: unknown | null };

const fetchPublicPages = async (portfolioId: string): Promise<PublicPage[]> => {
  try {
    // Try authenticated API first, fallback to public if needed
    const res = await api.get<PublicPage[]>(`/${portfolioId}/pages`);
    return res.data;
  } catch {
    // Fallback to public API
    const res = await publicApi.get<PublicPage[]>(`/${portfolioId}/pages`);
    return res.data;
  }
};

const withPageSections = async (page: PublicPage): Promise<PublicPage> => {
  if (Array.isArray(page.sections)) return page;
  try {
    // Try authenticated API first, fallback to public
    try {
      const res = await api.get<Section[]>(`/${page.id}/sections`);
      return { ...page, sections: res.data };
    } catch {
      const res = await publicApi.get<Section[]>(`/${page.id}/sections`);
      return { ...page, sections: res.data };
    }
  } catch {
    return { ...page, sections: [] };
  }
};

export default function PortfView({ idOrSlug }: { idOrSlug: string }) {
  const searchParams = useSearchParams();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [pages, setPages] = useState<PublicPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError(null);

    (async () => {
      const fetchedPortfolio = await getPortfolioByIDorSlug(idOrSlug);
      if (!isActive) return;

      if (!fetchedPortfolio) {
        setPortfolio(null);
        setPages([]);
        setError("Portfolio not found");
        return;
      }

      setPortfolio(fetchedPortfolio);
      recordPortfolioVisit({ id: fetchedPortfolio.id, slug: fetchedPortfolio.slug });

      try {
        const rawPages = await fetchPublicPages(fetchedPortfolio.id || idOrSlug);
        const pagesWithSections = await Promise.all(rawPages.map(withPageSections));
        const sorted = [...pagesWithSections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        if (!isActive) return;
        setPages(sorted);
      } catch (err) {
        if (!isActive) return;
        setPages([]);
        setError("Failed to load pages");
      }
    })()
      .catch(() => {
        if (!isActive) return;
        setError("Failed to load portfolio");
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [idOrSlug]);

  useEffect(() => {
    applyAssetsToDom(portfolio?.asset ?? null);
  }, [portfolio?.asset]);

  const pageParam = useMemo(() => searchParams?.get("page") || searchParams?.get("pageId") || null, [searchParams]);

  const selectedPage = useMemo(() => {
    if (!pages.length) return null;
    if (pageParam) return pages.find((p) => p.id === pageParam || p.slug === pageParam) ?? null;
    return pages.find(isHome) ?? pages[0];
  }, [pages, pageParam]);

  const sections = useMemo(() => {
    const raw = (selectedPage?.sections ?? []) as unknown;
    return Array.isArray(raw) ? mapSections(raw) : [];
  }, [selectedPage]);

  const headerConfig = useMemo(() => {
    const headerDef = sectionsVisualization["header"];
    if (!headerDef) return null;

    const headerFromSelected = sections.find((s) => s.type === "header");
    const inheritedHeader = headerFromSelected ? null : inheritHeaderConfig(pages as unknown as Page[]);
    const baseConfig = headerFromSelected?.config ?? inheritedHeader ?? headerDef.defaultConfig;
    const portfolioRoute = portfolio?.slug || idOrSlug;

    return {
      ...(headerDef.defaultConfig as Record<string, unknown>),
      ...(baseConfig as Record<string, unknown>),
      portfolioId: `portfolio/${portfolioRoute}`,
      pages: pages.map((p) => ({ id: p.id, title: p.title ?? p.slug, slug: p.slug })),
    };
  }, [sections, pages, portfolio?.slug, idOrSlug]);

  const nonHeaderSections = useMemo(() => sections.filter((s) => s.type !== "header"), [sections]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[--color-base-bg]">
        <Spinner className="size-6 text-[--color-description]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[--color-base-bg]">
        <p className="text-sm text-[--color-description]">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-portf-background">
      {headerConfig && (
        <div className="w-full">
          {(() => {
            const headerDef = sectionsVisualization["header"];
            if (!headerDef) return null;
            const isActive = (headerConfig as { active?: boolean })?.active !== false;
            if (!isActive) return null;
            return <headerDef.Design config={headerConfig} view="desktop" isPreview={false} asset={portfolio?.asset} />;
          })()}
        </div>
      )}

      <main className="w-full">
        {nonHeaderSections.length === 0 ? (
          <div className="text-sm text-[--color-description] text-center py-10">No sections to display.</div>
        ) : (
          <div className="w-full space-y-20 first:mt-20 last:mb-20">
            {nonHeaderSections.map((sec) => {
              const def = sectionsVisualization[sec.type];
              if (!def) {
                return (
                  <div key={sec.id} className="text-sm text-[--color-description] text-center py-4">
                    Unknown section type: {sec.type}
                  </div>
                );
              }
              const mergedConfig = { ...(def.defaultConfig as Record<string, unknown>), ...(sec.config || {}) };
              return <def.Design key={sec.id} config={mergedConfig} view="desktop" asset={portfolio?.asset} />;
            })}
          </div>
        )}
      </main>
    </div>
  );
}
