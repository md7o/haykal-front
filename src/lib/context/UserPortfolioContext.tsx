"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { resolveUserPortfolioId, fetchFullPortfolio } from "@/lib/helpers/portfolio-helpers";
import { Portfolio } from "@/lib/api/portfolios-api/portfolio-endpoints";
import { createPortfolio } from "@/lib/api/portfolios-api/portfolio-endpoints";
import { createPage } from "@/lib/api/portfolios-api/pages-endpoints";

const PORTFOLIO_ID_KEY = "portfolioId";

const getCachedPortfolioId = () => {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(PORTFOLIO_ID_KEY);
  } catch {
    return null;
  }
};

const setCachedPortfolioId = (id: string | null) => {
  if (typeof window === "undefined") return;
  try {
    if (id) sessionStorage.setItem(PORTFOLIO_ID_KEY, id);
    else sessionStorage.removeItem(PORTFOLIO_ID_KEY);
  } catch {
    /* ignore storage errors */
  }
};

interface UserPortfolioContextType {
  userPortfolioId: string | null;
  portfolioData: Portfolio | null;
  isLoading: boolean;
  refreshPortfolioId: () => Promise<void>;
  refreshPortfolioData: () => Promise<void>;
  createPortfolio: (status?: "DRAFT" | "PUBLISHED") => Promise<void>;
}

const UserPortfolioContext = createContext<UserPortfolioContextType | undefined>(undefined);

export function UserPortfolioProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const [userPortfolioId, setUserPortfolioId] = useState<string | null>(null);
  const [portfolioData, setPortfolioData] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshPortfolioId = useCallback(async () => {
    if (!user) {
      setUserPortfolioId(null);
      setPortfolioData(null);
      setCachedPortfolioId(null);
      return;
    }

    // We need the userId. The user object shape might vary based on auth implementation
    const userId = (user as any).userId || (user as any).id;
    if (!userId) return;

    setIsLoading(true);
    try {
      const cachedId = getCachedPortfolioId();

      if (cachedId) {
        const fullCached = await fetchFullPortfolio(cachedId);
        if (fullCached) {
          setUserPortfolioId(cachedId);
          setPortfolioData(fullCached);
          return;
        }
        setCachedPortfolioId(null);
      }

      const id = await resolveUserPortfolioId(String(userId));
      setUserPortfolioId(id);
      setCachedPortfolioId(id);

      if (id) {
        const fullData = await fetchFullPortfolio(id);
        setPortfolioData(fullData);
      } else {
        setPortfolioData(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refreshPortfolioData = useCallback(async () => {
    if (userPortfolioId) {
      setIsLoading(true);
      try {
        const fullData = await fetchFullPortfolio(userPortfolioId);
        setPortfolioData(fullData);
      } finally {
        setIsLoading(false);
      }
    } else {
      await refreshPortfolioId();
    }
  }, [userPortfolioId, refreshPortfolioId]);

  const createPortfolioFn = useCallback(
    async (status: "DRAFT" | "PUBLISHED" = "DRAFT") => {
      if (!user) return;
      setIsLoading(true);
      try {
        const userId = (user as any).userId || (user as any).id;
        if (!userId) throw new Error("User ID not found");

        // Create portfolio
        const newPortfolio = await createPortfolio(userId, "portfolio");

        if (newPortfolio?.id) {
          setCachedPortfolioId(newPortfolio.id);

          // Create default Home page
          await createPage(newPortfolio.id, {
            slug: "home",
            order: 0,
          });
        }

        await refreshPortfolioId();
      } catch (error) {
        console.error("Failed to create portfolio", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, refreshPortfolioId],
  );

  // Removed automatic portfolio loading on mount.
  // Pages that need portfolio data should explicitly call refreshPortfolioId() or refreshPortfolioData().

  const contextValue = useMemo(
    () => ({
      userPortfolioId,
      portfolioData,
      isLoading,
      refreshPortfolioId,
      refreshPortfolioData,
      createPortfolio: createPortfolioFn,
    }),
    [userPortfolioId, portfolioData, isLoading, refreshPortfolioId, refreshPortfolioData, createPortfolioFn],
  );

  return <UserPortfolioContext.Provider value={contextValue}>{children}</UserPortfolioContext.Provider>;
}

export function useUserPortfolio() {
  const context = useContext(UserPortfolioContext);
  if (context === undefined) {
    throw new Error("useUserPortfolio must be used within a UserPortfolioProvider");
  }
  return context;
}
