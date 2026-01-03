"use client";

import { useEffect, useState, use } from "react";
import { Portfolio } from "@/api/portfolios-api/portfolio-endpoints";
import {
  getPublicPortfolioById,
  getPublicPortfolioBySlug,
  getPortfolioById,
  getPortfolioBySlug,
} from "@/api/portfolios-api/portfolio-endpoints";
import { getPages } from "@/api/portfolios-api/pages-endpoints";
import { getSections } from "@/api/portfolios-api/sections-endpoints";
import LoadingScreen from "@/components/ui-tools/custom_ui/LoadingScreen";
import PublishedPortfolio from "@/components/pages/portfolio-feature/published-portfolio/PublishedPortfolio";

export default function CustomDesignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchFullPortfolio() {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Portfolio
        // Try public endpoints first
        let pf: Portfolio | null = null;

        // Check if ID is a UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        try {
          if (isUuid) {
            pf = await getPublicPortfolioById(id);
          } else {
            pf = await getPublicPortfolioBySlug(id);
          }
        } catch (err) {
          // If public fails (e.g. 401), try authenticated endpoints
          console.warn("Public fetch failed, trying authenticated...", err);
          try {
            if (isUuid) {
              pf = await getPortfolioById(id);
            } else {
              pf = await getPortfolioBySlug(id);
            }
          } catch (authErr) {
            console.error("Authenticated fetch failed", authErr);
          }
        }

        if (!pf) {
          if (mounted) setError("Portfolio not found");
          return;
        }

        // 2. Fetch Pages
        let pages = [];
        try {
          pages = await getPages(pf.id);
        } catch (e) {
          console.warn("Failed to fetch pages", e);
          pages = pf.pages || [];
        }

        // 3. Fetch Sections for each page
        const pagesWithSections = await Promise.all(
          pages.map(async (p) => {
            try {
              const sections = await getSections(p.id);
              return { ...p, sections };
            } catch (e) {
              console.warn(`Failed to load sections for page ${p.id}`, e);
              return { ...p, sections: [] };
            }
          })
        );

        // 4. Construct full portfolio object
        const fullPortfolio = {
          ...pf,
          pages: pagesWithSections as any[],
        };

        if (mounted) {
          setPortfolio(fullPortfolio);
        }
      } catch (err) {
        if (mounted) setError("Failed to load portfolio");
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (id) {
      fetchFullPortfolio();
    }
  }, [id]);

  if (loading) return <LoadingScreen />;

  if (error || !portfolio) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Portfolio Not Found</h1>
          <p className="text-muted-foreground">{error || "The portfolio you are looking for does not exist or is not public."}</p>
        </div>
      </div>
    );
  }

  return <PublishedPortfolio portfolio={portfolio} />;
}
