"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getPages } from "@/lib/api/portfolios-api/pages-endpoints";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface HeaderConfig {
  siteName: string;
  logoSrc?: string;
  fixed?: boolean;
  active?: boolean;
  backgroundType?: "none" | "normal";
  displayMode?: "logo" | "title" | "both";
  portfolioId?: string;
  pages?: Array<{ id: string; title: string; slug?: string | null }>;
}

interface HeaderDesignProps {
  config: HeaderConfig;
  view?: "desktop" | "mobile";
  isPreview?: boolean;
  asset?: unknown;
}

interface PageItem {
  id: string;
  title: string;
  slug?: string | null;
}

// ============================================================================
// Helper Functions
// ============================================================================

const sortPagesByOrder = (pages: any[]): PageItem[] => {
  return pages.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((p) => ({ id: p.id, title: p.title, slug: p.slug }));
};

const arePagesEqual = (prev: PageItem[], next: PageItem[]): boolean => {
  if (prev.length !== next.length) return false;
  return prev.every((p, i) => p.id === next[i].id && p.title === next[i].title);
};

// ============================================================================
// Sub-Components
// ============================================================================

function Logo({ src, siteName }: { src?: string; siteName: string }) {
  if (!src) return null;

  return (
    <div className="flex-shrink-0 py-0">
      <img
        src={src}
        alt={`${siteName} logo`}
        className="w-16 h-16 object-contain rounded-md transition-transform hover:scale-105"
      />
    </div>
  );
}

function SiteName({ name }: { name: string }) {
  return (
    <div className="flex-shrink-0 py-4">
      <span className="text-lg font-bold text-white tracking-tight font-portf-font">{name || "Portfolio"}</span>
    </div>
  );
}

function Navigation({ pages, isPreview, portfolioId }: { pages: PageItem[]; isPreview: boolean; portfolioId?: string }) {
  if (!pages.length) return null;
  const searchParams = useSearchParams();
  const urlSelected = useMemo(() => {
    return searchParams?.get("page") || searchParams?.get("pageId") || null;
  }, [searchParams]);

  return (
    <nav className="ml-auto hidden md:block" aria-label="Main navigation">
      <ul className="flex items-center gap-1">
        {pages.map((page) => {
          const isActive = urlSelected && urlSelected === (page.slug || page.id);
          const base = "px-4 py-2 text-base font-medium text-white rounded-soft transition-all duration-200";
          const activeCls = isActive ? "bg-black/20 text-white" : "hover:bg-black/10";

          const href = isPreview
            ? `?page=${page.slug || page.id}`
            : portfolioId
              ? `/${portfolioId}?page=${page.slug || page.id}`
              : `?page=${page.slug || page.id}`;

          return (
            <li key={page.id}>
              <Link href={href} scroll={!isPreview} className={`${base} ${activeCls}`}>
                {page.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function HeaderBlock({ config, view = "desktop", isPreview = false, asset }: HeaderDesignProps) {
  const {
    siteName,
    logoSrc,
    fixed = true,
    backgroundType = "normal",
    displayMode = "both",
    pages: configPages = [],
    portfolioId,
  } = config;

  const [pages, setPages] = useState<PageItem[]>(configPages);

  // Fetch pages dynamically when portfolioId is available
  useEffect(() => {
    // In preview mode, rely on config pages only (avoid extra fetches).
    if (isPreview) {
      setPages((prev) => (arePagesEqual(prev, configPages) ? prev : configPages));
      return;
    }

    // If pages are provided in config (e.g. from PublishedPortfolio or updated DisplayPage), use them.
    if (configPages.length > 0) {
      setPages((prev) => (arePagesEqual(prev, configPages) ? prev : configPages));
      return;
    }

    if (!portfolioId) {
      setPages((prev) => (arePagesEqual(prev, configPages) ? prev : configPages));
      return;
    }

    getPages(portfolioId)
      .then((fetchedPages) => {
        const sortedPages = sortPagesByOrder(fetchedPages);
        setPages((prev) => (arePagesEqual(prev, sortedPages) ? prev : sortedPages));
      })
      .catch((error) => {
        console.error("Failed to fetch pages for header:", error);
      });
  }, [portfolioId, configPages, isPreview]);

  // Memoized style classes
  const headerClasses = useMemo(() => {
    const baseClasses = "z-50 w-full transition-all duration-300";
    const positionClasses = fixed ? "sticky top-0" : "relative";
    const backgroundClasses =
      backgroundType === "normal"
        ? "bg-portf-primary/95 backdrop-blur-md shadow-sm border-b border-portf-border/50"
        : "bg-transparent";

    return `${baseClasses} ${positionClasses} ${backgroundClasses}`;
  }, [fixed, backgroundType]);

  const containerClasses = useMemo(() => {
    const widthClasses = view === "mobile" ? "xl:w-[25rem] w-full" : "w-full max-w-7xl";
    return `mx-auto ${widthClasses} px-6`;
  }, [view]);

  return (
    <header className={headerClasses}>
      <div className={containerClasses}>
        <div className="flex items-center justify-between gap-4">
          {/* Left Section: Logo + Site Name */}
          <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
            {(displayMode === "logo" || displayMode === "both") && <Logo src={logoSrc} siteName={siteName} />}
            {(displayMode === "title" || displayMode === "both") && <SiteName name={siteName} />}
          </div>

          {/* Right Section: Navigation */}
          <Navigation pages={pages} isPreview={isPreview} portfolioId={portfolioId} />
        </div>
      </div>
    </header>
  );
}
