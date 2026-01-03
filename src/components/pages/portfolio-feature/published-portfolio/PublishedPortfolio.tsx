"use client";

import { useEffect, useMemo, useState } from "react";
import { Portfolio } from "@/api/portfolios-api/portfolio-endpoints";
import PortfolioTheme from "@/components/theme/PortfolioTheme";
import { Button } from "@/components/ui-tools/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui-tools/ui/tooltip";
import { Edit, LayoutDashboard } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { sectionsVisualization } from "../sections-design/sectionsVisualization";
import HeaderBlock, { HeaderConfig } from "../sections-design/header-block/HeaderBlock";

type SectionItem = { id?: string; type: string; config: unknown };

function applyAssetsToDom(assets: any) {
  if (typeof window === "undefined" || !assets) return;
  try {
    const root = document.documentElement.style;
    const palette = assets.palette || {};
    const font = assets.font;
    const primary = (palette.primary || "").trim();
    const secondary = (palette.secondary || "").trim();
    if (primary) root.setProperty("--portfolio-accent-cus", primary);
    if (secondary) {
      root.setProperty("--portfolio-card-bg-cus", secondary);
      root.setProperty("--portfolio-secondary-card-cus", secondary);
      if (!root.getPropertyValue("--portfolio-background-cus")) root.setProperty("--portfolio-background-cus", secondary);
    }
    if (font) {
      document.documentElement.style.setProperty("--font-montserrat-cus", font);
      document.body.style.setProperty("--font-montserrat-cus", font);
    }
  } catch {
    /* ignore */
  }
}

function SectionRenderer({
  sec,
  idx,
  view,
  isPreview,
}: {
  sec: SectionItem;
  idx: number;
  view: "desktop" | "mobile";
  isPreview: boolean;
}) {
  const def = sectionsVisualization[sec.type as keyof typeof sectionsVisualization];
  if (!def)
    return (
      <div key={idx} className=" mb-4 p-4 text-sm text-red-600">
        There is no section {sec.type}
      </div>
    );
  const Design = def.Design;
  return (
    <div key={idx} className={` first:mt-10 last:mb-10 my-14 `}>
      <Design config={sec.config} view={view} {...(sec.type === "header" ? { isPreview } : {})} />
    </div>
  );
}

interface PublishedPortfolioProps {
  portfolio: Portfolio | null;
  view?: "desktop" | "mobile";
  showControls?: boolean;
  isPreview?: boolean;
  activePageSlug?: string;
}

export default function PublishedPortfolio({
  portfolio,
  view = "desktop",
  showControls = true,
  isPreview = false,
  activePageSlug,
}: PublishedPortfolioProps) {
  const searchParams = useSearchParams();
  const pageSlug = activePageSlug || searchParams.get("page") || searchParams.get("pageId");
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const onHashChange = () => setCurrentHash(window.location.hash.replace(/^#/, ""));
      window.addEventListener("hashchange", onHashChange);
      setCurrentHash(window.location.hash.replace(/^#/, ""));
      return () => window.removeEventListener("hashchange", onHashChange);
    }
  }, []);

  const { sections, headerConfig } = useMemo(() => {
    if (!portfolio) return { sections: [], headerConfig: null };

    // Determine active page
    let page = portfolio.pages?.[0];

    // Try hash first, then search param
    if (currentHash && portfolio.pages) {
      const found = portfolio.pages.find((p) => p.slug === currentHash);
      if (found) page = found;
    } else if (pageSlug && portfolio.pages) {
      const found = portfolio.pages.find((p) => p.slug === pageSlug || p.id === pageSlug);
      if (found) page = found;
    }

    // Prepare navigation items
    const navPages = (portfolio.pages || []).map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug || "",
    }));

    const raw = page?.sections;
    let arr: any[] = [];
    try {
      const tmp = typeof raw === "string" ? JSON.parse(raw) : raw;
      arr = Array.isArray(tmp) ? tmp : [];
    } catch {
      arr = [];
    }

    let foundHeaderConfig: HeaderConfig | null = null;

    const processedSections = arr
      .map((item: any, index: number) => {
        if (!item || typeof item !== "object") return null;
        const type = typeof item.type === "string" ? item.type : undefined;
        if (!type) return null;

        const def = sectionsVisualization[type as keyof typeof sectionsVisualization];
        const rawConfig = item.config && typeof item.config === "object" ? item.config : {};
        // Merge default config with saved config to ensure all fields are present
        const config = { ...(def?.defaultConfig || {}), ...rawConfig };

        // Capture header config if found
        if (type === "header") {
          if (!isPreview || !(config as any).pages?.length) {
            (config as any).pages = navPages;
          }
          (config as any).portfolioId = portfolio.id;
          foundHeaderConfig = config as HeaderConfig;
          // We will render header separately, so return null here to remove from flow
          return null;
        }
        return { id: item.id || `idx-${index}`, type, config } as SectionItem;
      })
      .filter(Boolean) as SectionItem[];

    // If no header found in sections, try to find one in assets or use default
    if (!foundHeaderConfig) {
      // Fallback default header
      foundHeaderConfig = {
        siteName: "My Portfolio",
        fixed: true,
        pages: navPages,
        backgroundType: "normal",
        portfolioId: portfolio.id,
      };
    }

    return { sections: processedSections, headerConfig: foundHeaderConfig };
  }, [portfolio, pageSlug, currentHash, isPreview]);

  const assets = portfolio?.assets || null;
  const route = useRouter();

  useEffect(() => {
    if (assets) {
      applyAssetsToDom(assets);
    }
  }, [assets]);

  if (!portfolio) return <div className="p-6">No portfolio data provided.</div>;

  return (
    <div className="min-h-dvh">
      <PortfolioTheme assets={assets}>
        <div className="relative flex flex-col  overflow-hidden w-full min-h-dvh">
          {/* Always render Header at the top */}
          {headerConfig && <HeaderBlock config={headerConfig} view={view} isPreview={isPreview} />}

          {!sections.length && (
            <div className="flex-1 flex items-center justify-center p-6 text-sm text-description text-center">
              No sections found for this design.
            </div>
          )}
          {!!sections.length && (
            <div>
              {sections.map((sec, idx) => (
                <SectionRenderer key={sec.id || idx} sec={sec} idx={idx} view={view} isPreview={isPreview} />
              ))}
            </div>
          )}
        </div>
      </PortfolioTheme>
      {showControls && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-start gap-1">
          <Tooltip>
            <TooltipTrigger>
              <Button asChild variant="bobble" aria-label="Edit design">
                <span
                  onClick={() => {
                    route.push(`/studio?id=${encodeURIComponent(portfolio.id || "")}`);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={3}>
              Studio Edit
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Button asChild variant="bobble" aria-label="Open dashboard sections">
                <span
                  onClick={() => {
                    route.push("/dashboard/preview");
                  }}
                >
                  <LayoutDashboard className="w-4 h-4" />
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={3}>
              Back To Dashboard
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
