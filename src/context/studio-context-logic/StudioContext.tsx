"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from "react";
import { AnySectionInstance } from "@/types/sections";
import { useAuthStore } from "@/store/authStore";
import { useUserPortfolio } from "@/context/UserPortfolioContext";
import { SectionType } from "@/components/pages/portfolio-feature/sections-design/sectionsVisualization";
import { buildAvailableSections, findPage, isHome, mapSections } from "./studio-utils";
import { useStudioPages } from "./useStudioPages";
import { useStudioSections } from "./useStudioSections";
import { Page } from "@/api/portfolios-api/pages-endpoints";
import { saveFullPortfolio, updatePortfolio } from "@/api/portfolios-api/portfolio-endpoints";

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
  flushDraft: (opts?: { force?: boolean }) => Promise<void>;
  isLoading: boolean;
  refreshPortfolioData: () => Promise<void>;
}

const StudioContext = createContext<StudioContextShape | undefined>(undefined);

export function StudioProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const {
    userPortfolioId,
    portfolioData,
    refreshPortfolioData,
    isLoading: isPortfolioLoading,
    refreshPortfolioId,
  } = useUserPortfolio();

  const didRequestRef = useRef(false);
  useEffect(() => {
    if (didRequestRef.current) return;
    if (isLoading) return;
    if (!user) return;
    if (portfolioData || userPortfolioId) return;
    didRequestRef.current = true;
    refreshPortfolioId();
  }, [isLoading, user, portfolioData, userPortfolioId, refreshPortfolioId]);

  const [available] = useState<{ type: string; label: string }[]>(() => buildAvailableSections());
  const [selectedPageId, _setSelectedPageId] = useState<string | null>(null);

  const [slug, _setSlug] = useState<string | null>(null);
  const [assets, _setAssets] = useState<unknown | null>(null);
  const dirtyRef = useRef(false);
  const markDirty = useCallback(() => {
    dirtyRef.current = true;
  }, []);

  const { pages, setPages, addPage, updatePageDetails, deletePage, movePage } = useStudioPages(
    userPortfolioId,
    refreshPortfolioData,
    selectedPageId,
    _setSelectedPageId,
    markDirty,
  );

  const { used, setUsed, selectedSectionId, selectSection, addSection, removeSection, reorderUsed, updateSectionConfig } =
    useStudioSections(selectedPageId, pages, refreshPortfolioData, markDirty);

  const setSelectedPageId = useCallback(
    (idOrSlug: string | null) => _setSelectedPageId(idOrSlug ? (findPage(pages, idOrSlug)?.id ?? null) : null),
    [pages],
  );

  const portfolioId = userPortfolioId;

  const buildFullSnapshot = useCallback(() => {
    if (!portfolioId) return null;
    const pagesWithSections = (portfolioData?.pages || []).map((p: Page) => {
      if (p.id !== selectedPageId) return p;
      return {
        ...p,
        sections: used.map((s) => ({ id: s.id, type: s.type, config: s.config, name: s.name })),
      } satisfies Page;
    });

    return {
      id: portfolioId,
      slug,
      assets,
      pages: pagesWithSections,
      status: portfolioData?.status,
      userId: portfolioData?.userId,
    } as any;
  }, [portfolioId, portfolioData?.pages, portfolioData?.status, portfolioData?.userId, selectedPageId, used, slug, assets]);

  const flushDraft = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      if (!portfolioId) return;
      if (!dirtyRef.current && !force) return;
      const snapshot = buildFullSnapshot();
      if (!snapshot) return;
      try {
        await saveFullPortfolio(portfolioId, snapshot);
        dirtyRef.current = false;
      } catch (err) {
        console.error("Failed to flush draft", err);
      }
    },
    [buildFullSnapshot, portfolioId],
  );

  const patchPortfolio = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!portfolioId) return;
      try {
        await updatePortfolio(portfolioId, payload);
      } catch (e) {
        console.error("Failed to update portfolio", e);
      }
    },
    [portfolioId],
  );

  useEffect(() => {
    if (!portfolioData) {
      setPages([]);
      _setSlug(null);
      _setAssets(null);
      return;
    }

    _setSlug((prev) => (prev !== (portfolioData.slug ?? null) ? (portfolioData.slug ?? null) : prev));
    _setAssets((prev: any) =>
      JSON.stringify(prev) !== JSON.stringify(portfolioData.assets ?? null) ? (portfolioData.assets ?? null) : prev,
    );

    if (portfolioData.pages) {
      setPages((prev) =>
        prev.length === portfolioData.pages.length && prev.every((p, i) => p.id === portfolioData.pages[i].id)
          ? prev
          : portfolioData.pages,
      );

      _setSelectedPageId((prev) => {
        if (prev && portfolioData.pages.some((p: Page) => p.id === prev)) return prev;
        const home = portfolioData.pages.find(isHome);
        return home ? home.id : (portfolioData.pages[0]?.id ?? null);
      });
    }
  }, [portfolioData, setPages]);

  useEffect(() => {
    if (!selectedPageId || !portfolioData?.pages) {
      if (!selectedPageId) setUsed([]);
      return;
    }

    const page = portfolioData.pages.find((p: Page) => p.id === selectedPageId);
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

  // Mark state as dirty whenever core editor data changes
  useEffect(() => {
    dirtyRef.current = true;
  }, [used, pages, slug, assets]);

  // On tab close, attempt to send the latest snapshot via beacon
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      const snapshot = buildFullSnapshot();
      if (!snapshot || !portfolioId) return;
      try {
        const blob = new Blob([JSON.stringify(snapshot)], { type: "application/json" });
        navigator.sendBeacon(`${process.env.NEXT_PUBLIC_API_URL}/portfolio/${portfolioId}/full`, blob);
      } catch (err) {
        console.error("Beacon flush failed", err);
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [buildFullSnapshot, portfolioId]);

  const setSlug = useCallback(
    async (s: string | null) => {
      _setSlug(s);
      markDirty();
    },
    [markDirty],
  );

  const setAssets = useCallback(
    async (a: unknown | null) => {
      _setAssets(a);
      markDirty();
    },
    [markDirty],
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
        flushDraft,
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
