"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { useUserPortfolio } from "@/lib/context/UserPortfolioContext";
import { fetchFullPortfolio } from "@/lib/helpers/portfolio-helpers";
import { applyAssetsToDom } from "@/lib/theme-utils";
import type { Asset } from "@/lib/types/asset";
import { getAssetByPortfolioId } from "../api/portfolios-api/assets-endpoints";

/**
 * PortfolioContext: Manages portfolio-level metadata
 * Responsibilities: Portfolio ID, slug, theme/assets, loading state, theme updates
 * Used by: Any component needing portfolio info
 */

export interface PortfolioContextType {
  portfolioId: string | null;
  slug: string | null;
  setSlug: (s: string | null) => void;
  asset: Asset | null;
  setAsset: (a: Asset | null) => void;
  refreshAsset: () => Promise<void>;
  isLoading: boolean;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children, portfolioId }: { children: ReactNode; portfolioId?: string }) {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const { userPortfolioId, portfolioData: userPortfolioData, isLoading: isUserPortfolioLoading } = useUserPortfolio();
  type PortfolioMeta = { slug?: string | null } | null;
  const [overridePortfolioData, setOverridePortfolioData] = useState<PortfolioMeta>(null);
  const [isOverrideLoading, setIsOverrideLoading] = useState(false);

  const activePortfolioId = portfolioId ?? userPortfolioId;
  const activePortfolioData =
    portfolioId && portfolioId !== userPortfolioId ? overridePortfolioData : (userPortfolioData as PortfolioMeta | null);
  const isLoading = portfolioId && portfolioId !== userPortfolioId ? isOverrideLoading : isUserPortfolioLoading;

  // Fetch override portfolio if needed
  useEffect(() => {
    if (!portfolioId || portfolioId === userPortfolioId) {
      setOverridePortfolioData(null);
      setIsOverrideLoading(false);
      return;
    }

    // Wait for auth initialization before making API call
    if (!isInitialized) {
      return;
    }

    let isActive = true;
    setIsOverrideLoading(true);
    fetchFullPortfolio(portfolioId)
      .then((data) => {
        if (!isActive) return;
        setOverridePortfolioData(data ?? null);
      })
      .catch(() => {
        if (!isActive) return;
        setOverridePortfolioData(null);
      })
      .finally(() => {
        if (!isActive) return;
        setIsOverrideLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [portfolioId, userPortfolioId, isInitialized]);

  // Portfolio metadata
  const [slug, setSlug] = useState<string | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);

  // Sync metadata and asset from portfolio data
  useEffect(() => {
    // Only reset if explicitly null (meaning fetch completed and returned nothing)
    // Don't reset if just undefined or loading
    if (activePortfolioData === null) {
      // DO NOT RESET HERE during loading transitions
      // Only reset if we confirmed there is NO data
      // setSlug(null);
      // setAsset(null);
      return;
    }

    if (activePortfolioData) {
      // Always sync slug from portfolio data (source of truth)
      // activePortfolioData may be any shape depending on source, cast to access slug safely
      setSlug((activePortfolioData as { slug?: string | null })?.slug ?? null);
      setAsset((activePortfolioData as { asset?: Asset | null })?.asset ?? null);
    }
  }, [activePortfolioData]);

  const refreshAsset = async () => {
    if (!activePortfolioId) return;
    try {
      const next = await getAssetByPortfolioId(activePortfolioId);
      setAsset(next ?? null);
    } catch {
      setAsset(null);
    }
  };

  useEffect(() => {
    if (!activePortfolioId) return;
    if (activePortfolioData && (activePortfolioData as { asset?: Asset | null })?.asset) return;
    refreshAsset();
  }, [activePortfolioId, activePortfolioData]);

  useEffect(() => {
    applyAssetsToDom(asset);
  }, [asset]);

  const contextValue = useMemo(
    () => ({
      portfolioId: activePortfolioId,
      slug,
      setSlug,
      asset,
      setAsset,
      refreshAsset,
      isLoading,
    }),
    [activePortfolioId, slug, asset, isLoading],
  );

  return <PortfolioContext.Provider value={contextValue}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error("usePortfolio must be inside PortfolioProvider");
  return context;
}
