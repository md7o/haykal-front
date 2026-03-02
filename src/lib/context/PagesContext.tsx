"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from "react";
import { usePortfolio } from "@/lib/context/PortfolioContext";
import { useUserPortfolio } from "@/lib/context/UserPortfolioContext";
import { useAuthStore } from "@/lib/store/authStore";
import { getPages, createPage, updatePage, removePage } from "@/lib/api/portfolios-api/pages-endpoints";
import { Page } from "@/lib/api/portfolios-api/pages-endpoints";
import { findPage, isHome } from "@/lib/context/hooks/studio-utils";

/**
 * PagesContext: Manages pages state and operations
 * Responsibilities: Fetching pages, CRUD operations, selection, reordering
 * Used by: PagesSidebar, DisplayPage, portfolio pages
 */

export interface PagesContextType {
  pages: Page[];
  selectedPageId: string | null;
  setSelectedPageId: (idOrSlug: string | null) => void;
  addPage: (slug: string) => Promise<string | null>;
  updatePageDetails: (id: string, partial: { slug?: string }) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  reorderPages: (pageIds: string[]) => Promise<void>;
  isPagesLoading: boolean;
}

const PagesContext = createContext<PagesContextType | undefined>(undefined);

export function PagesProvider({ children }: { children: ReactNode }) {
  const { portfolioId } = usePortfolio();
  const { refreshPortfolioId } = useUserPortfolio();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageId, _setSelectedPageId] = useState<string | null>(null);
  const [isPagesLoading, setIsPagesLoading] = useState(false);

  // Normalize page selection
  const setSelectedPageId = useCallback(
    (idOrSlug: string | null) => {
      const page = idOrSlug ? findPage(pages, idOrSlug) : null;
      _setSelectedPageId(page?.id ?? null);
    },
    [pages],
  );

  // Fetch pages when portfolio changes
  useEffect(() => {
    // Only clear pages if we're truly logged out or uninitialized
    // If we're initialized but waiting for portfolioId, don't clear yet
    if (!isInitialized || !user) {
      if (pages.length > 0) setPages([]);
      if (selectedPageId) _setSelectedPageId(null);
      return;
    }

    if (!portfolioId) {
      // If we have no portfolio ID yet, we can't fetch.
      // But let's avoid clearing aggressively if it's just a momentary state during refresh.
      return;
    }

    const fetchPages = async () => {
      setIsPagesLoading(true);
      try {
        const fetchedPages = await getPages(portfolioId);
        setPages(fetchedPages);

        // Auto-select home page or first page if nothing selected or current selection invalid
        // But try to preserve selection if possible (e.g. from URL or previous state)
        const home = fetchedPages.find(isHome);
        const currentSelected = fetchedPages.find((p) => p.id === selectedPageId);

        if (!currentSelected) {
          _setSelectedPageId(home?.id ?? fetchedPages[0]?.id ?? null);
        }
      } catch (err) {
        console.error("Failed to fetch pages:", err);
        setPages([]);
      } finally {
        setIsPagesLoading(false);
      }
    };

    fetchPages();
  }, [portfolioId, isInitialized, user]);

  // Ensure portfolio id is resolved for pages fetching
  useEffect(() => {
    if (!portfolioId && isInitialized && user) {
      refreshPortfolioId();
    }
  }, [portfolioId, isInitialized, user, refreshPortfolioId]);

  // PAGE OPERATIONS (direct API calls with optimistic updates)
  const addPage = useCallback(
    async (slug: string): Promise<string | null> => {
      if (!portfolioId) return null;

      const normalizedSlug = slug.trim().toLowerCase();
      if (!normalizedSlug || normalizedSlug === "home") return null;
      if (pages.some((p) => p.slug.toLowerCase() === normalizedSlug)) return null;

      const tempId = `temp-${Date.now()}`;
      const newPage: Page = {
        id: tempId,
        portfolioId,
        slug: normalizedSlug,
        sections: null,
        order: pages.length,
      };

      setPages((prev) => [...prev, newPage]);

      try {
        const created = await createPage(portfolioId, {
          slug: normalizedSlug,
        });
        setPages((prev) => prev.map((p) => (p.id === tempId ? created : p)));
        return created.id;
      } catch (err) {
        setPages((prev) => prev.filter((p) => p.id !== tempId));
        throw err;
      }
    },
    [portfolioId, pages],
  );

  const updatePageDetails = useCallback(
    async (id: string, partial: { slug?: string }): Promise<void> => {
      if (!portfolioId) return;

      const page = pages.find((p) => p.id === id);
      if (!page || isHome(page)) return;

      const originalPage = { ...page };
      setPages((prev) => prev.map((p) => (p.id === id ? { ...p, ...partial } : p)));

      try {
        await updatePage(portfolioId, id, partial);
      } catch (err) {
        setPages((prev) => prev.map((p) => (p.id === id ? originalPage : p)));
        throw err;
      }
    },
    [portfolioId, pages],
  );

  const deletePage = useCallback(
    async (id: string): Promise<void> => {
      if (!portfolioId) return;

      const page = pages.find((p) => p.id === id);
      if (!page || isHome(page)) return;

      const originalPages = [...pages];
      setPages((prev) => prev.filter((p) => p.id !== id));

      try {
        await removePage(portfolioId, id);
      } catch (err) {
        setPages(originalPages);
        throw err;
      }
    },
    [portfolioId, pages],
  );

  const reorderPagesHandler = useCallback(
    async (pageIds: string[]): Promise<void> => {
      if (!portfolioId) return;

      const originalPages = [...pages];
      const reordered = pageIds
        .map((id) => pages.find((p) => p.id === id))
        .filter((p): p is Page => p !== undefined)
        .map((p, idx) => ({ ...p, order: idx }));

      setPages(reordered);

      try {
        await reorderPagesApi(portfolioId, pageIds);
      } catch (err) {
        setPages(originalPages);
        throw err;
      }
    },
    [portfolioId, pages],
  );

  const contextValue = useMemo(
    () => ({
      pages,
      selectedPageId,
      setSelectedPageId,
      addPage,
      updatePageDetails,
      deletePage,
      reorderPages: reorderPagesHandler,
      isPagesLoading,
    }),
    [pages, selectedPageId, setSelectedPageId, addPage, updatePageDetails, deletePage, reorderPagesHandler, isPagesLoading],
  );

  return <PagesContext.Provider value={contextValue}>{children}</PagesContext.Provider>;
}

export function usePages() {
  const context = useContext(PagesContext);
  if (!context) throw new Error("usePages must be inside PagesProvider");
  return context;
}
function reorderPagesApi(portfolioId: string, pageIds: string[]) {
  throw new Error("Function not implemented.");
}
