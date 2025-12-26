"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { AnySectionInstance } from "@/types/sections";
import { updatePortfolio } from "@/api/portfolio-endpoints";
import { Page } from "@/api/pages-endpoints";
import { useAuth } from "@/context/AuthContext";
import { useUserPortfolio } from "@/context/UserPortfolioContext";
import { SectionType } from "@/components/pages/portfolio-feature/sections-design/sectionsVisualization";
import { buildAvailableSections, findPage, isHome, mapSections } from "./studio-context-logic/studio-utils";
import { useStudioPages } from "./useStudioPages";
import { useStudioSections } from "./useStudioSections";

export interface StudioContextShape {
  used: AnySectionInstance[];
  available: { type: string; label: string }[];
  pages: Page[];
  addPage: (title: string) => Promise<string | null>;
  updatePageDetails: (id: string, partial: { title?: string; slug?: string }) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  movePage: (from: number, to: number) => Promise<void>;
  addSection: (type: SectionType) => Promise<void>;
  removeSection: (id: string) => Promise<void>;
  reorderUsed: (from: number, to: number) => Promise<void>;
  updateSectionConfig: (id: string, partial: Record<string, unknown>) => Promise<void>;
  selectedSectionId: string | null;
  selectSection: (id: string | null) => void;
  selectedPageId: string | null;
  setSelectedPageId: (id: string | null) => void;
  portfolioId: string | null;
  slug: string | null;
  setSlug: (s: string | null) => void;
  assets: unknown | null;
  setAssets: (a: unknown | null) => void;
  isLoading: boolean;
  refreshPortfolioData: () => Promise<void>;
}

const StudioContext = createContext<StudioContextShape | undefined>(undefined);

export function StudioProvider({ children }: { children: ReactNode }) {
  useAuth();
  const { userPortfolioId, portfolioData, refreshPortfolioData, isLoading: isPortfolioLoading } = useUserPortfolio();

  const [available] = useState<{ type: string; label: string }[]>(() => buildAvailableSections());
  const [selectedPageId, _setSelectedPageId] = useState<string | null>(null);

  const { pages, setPages, addPage, updatePageDetails, deletePage, movePage } = useStudioPages(
    userPortfolioId,
    refreshPortfolioData,
    selectedPageId,
    _setSelectedPageId
  );

  const { used, setUsed, selectedSectionId, selectSection, addSection, removeSection, reorderUsed, updateSectionConfig } =
    useStudioSections(selectedPageId, pages, refreshPortfolioData);

  const setSelectedPageId = useCallback(
    (idOrSlug: string | null) => _setSelectedPageId(idOrSlug ? findPage(pages, idOrSlug)?.id ?? null : null),
    [pages]
  );

  const portfolioId = userPortfolioId;
  const [slug, _setSlug] = useState<string | null>(null);
  const [assets, _setAssets] = useState<unknown | null>(null);

  const patchPortfolio = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!portfolioId) return;
      try {
        await updatePortfolio(portfolioId, payload);
      } catch (e) {
        console.error("Failed to update portfolio", e);
      }
    },
    [portfolioId]
  );

  useEffect(() => {
    if (!portfolioData) {
      setPages([]);
      _setSlug(null);
      _setAssets(null);
      return;
    }

    _setSlug((prev) => (prev !== (portfolioData.slug ?? null) ? portfolioData.slug ?? null : prev));
    _setAssets((prev: any) =>
      JSON.stringify(prev) !== JSON.stringify(portfolioData.assets ?? null) ? portfolioData.assets ?? null : prev
    );

    if (portfolioData.pages) {
      setPages((prev) =>
        prev.length === portfolioData.pages.length && prev.every((p, i) => p.id === portfolioData.pages[i].id)
          ? prev
          : portfolioData.pages
      );

      _setSelectedPageId((prev) => {
        if (prev && portfolioData.pages.some((p) => p.id === prev)) return prev;
        const home = portfolioData.pages.find(isHome);
        return home ? home.id : portfolioData.pages[0]?.id ?? null;
      });
    }
  }, [portfolioData, setPages]);

  useEffect(() => {
    if (!selectedPageId || !portfolioData?.pages) {
      if (!selectedPageId) setUsed([]);
      return;
    }

    const page = portfolioData.pages.find((p) => p.id === selectedPageId);
    if (!page) {
      setUsed([]);
      return;
    }

    const sections = (page as any)?.sections || [];
    const mapped = mapSections(sections);

    setUsed((prev) => {
      if (prev.length === mapped.length && prev.every((p, i) => p.id === mapped[i].id)) {
        return prev;
      }
      return mapped;
    });
  }, [selectedPageId, portfolioData, setUsed]);

  const setSlug = useCallback(
    async (s: string | null) => {
      _setSlug(s);
      await patchPortfolio({ slug: s });
    },
    [patchPortfolio]
  );

  const setAssets = useCallback(
    async (a: unknown | null) => {
      _setAssets(a);
      await patchPortfolio({ assets: a as Record<string, any> });
    },
    [patchPortfolio]
  );

  return (
    <StudioContext.Provider
      value={{
        used,
        available,
        pages,
        addSection,
        removeSection,
        reorderUsed,
        updateSectionConfig,
        selectedSectionId,
        selectSection,
        selectedPageId,
        setSelectedPageId,
        portfolioId,
        slug,
        setSlug,
        assets,
        setAssets,
        isLoading: isPortfolioLoading,
        refreshPortfolioData,
        addPage,
        updatePageDetails,
        deletePage,
        movePage,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used inside StudioProvider");
  return ctx;
}
