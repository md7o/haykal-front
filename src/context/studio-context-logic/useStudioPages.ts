import { useState, useCallback } from "react";
import { Page } from "@/api/portfolios-api/pages-endpoints";
import { isHome, toSlug } from "./studio-utils";

export function useStudioPages(
  portfolioId: string | null,
  refreshPortfolioData: () => Promise<void>,
  selectedPageId: string | null,
  setSelectedPageId: (id: string | null) => void,
  markDirty: () => void
) {
  const [pages, setPages] = useState<Page[]>([]);

  const addPage = useCallback(
    async (title: string) => {
      if (!portfolioId) return null;
      const normalizedTitle = title.trim() || "New Page";
      if (normalizedTitle.toLowerCase() === "home") return null;
      const slug = toSlug(normalizedTitle);
      if (slug === "home") return null;

      const existingTitles = new Set(pages.map((p) => p.title.toLowerCase()));
      let finalTitle = normalizedTitle;
      if (existingTitles.has(finalTitle.toLowerCase())) {
        let i = 2;
        while (existingTitles.has(`${finalTitle} ${i}`.toLowerCase())) i++;
        finalTitle = `${finalTitle} ${i}`;
      }

      // Optimistic add; persist via bulk save later
      const tempId = crypto.randomUUID();
      setPages((prev) => [...prev, { id: tempId, title: finalTitle, slug, sections: [], order: prev.length } as any]);
      markDirty();
      return tempId;
    },
    [portfolioId, pages, markDirty]
  );

  const updatePageDetails = useCallback(
    async (id: string, partial: { title?: string; slug?: string }) => {
      if (!portfolioId) return;
      const page = pages.find((p) => p.id === id);
      if (!page || isHome(page)) return;

      setPages((prev) => prev.map((p) => (p.id === id ? { ...p, ...partial } : p)));

      markDirty();
    },
    [portfolioId, pages, markDirty]
  );

  const deletePage = useCallback(
    async (id: string) => {
      if (!portfolioId) return;
      const page = pages.find((p) => p.id === id);
      if (!page || isHome(page)) return;

      setPages((prev) => {
        const next = prev.filter((p) => p.id !== id);
        if (selectedPageId === id) setSelectedPageId(next[0]?.id ?? null);
        return next;
      });

      markDirty();
    },
    [portfolioId, pages, selectedPageId, markDirty, setSelectedPageId]
  );

  const movePage = useCallback(
    async (from: number, to: number) => {
      if (!portfolioId) return;
      let newOrder: Page[] = [];

      setPages((prev) => {
        const clone = [...prev];
        if (from < 0 || to < 0 || from >= prev.length || to >= prev.length) return prev;

        const [item] = clone.splice(from, 1);
        clone.splice(to, 0, item);

        newOrder = clone.map((p, idx) => ({ ...p, order: idx }));
        return newOrder;
      });

      markDirty();
    },
    [portfolioId, markDirty]
  );

  return {
    pages,
    setPages,
    addPage,
    updatePageDetails,
    deletePage,
    movePage,
  };
}
