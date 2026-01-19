"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCommunityDataBySlug } from "@/api/community/communityData-endpoints";
import type { communityDataType } from "@/api/community/communityData-endpoints";

interface CommunityContextType {
  communityData: communityDataType | null;
  isLoading: boolean;
  error: string | null;
  refreshCommunityData: () => Promise<void>;
  updateCommunityData: (data: communityDataType) => void;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const [communityData, setCommunityData] = useState<communityDataType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCommunity = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCommunityDataBySlug(slug);
      setCommunityData(data);
    } catch (err) {
      console.error("Failed to load community data:", err);
      setError(err instanceof Error ? err.message : "Failed to load community data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCommunity();
  }, [slug]);

  const refreshCommunityData = async () => {
    await loadCommunity();
  };

  const updateCommunityData = (data: communityDataType) => {
    setCommunityData(data);
  };

  return (
    <CommunityContext.Provider
      value={{
        communityData,
        isLoading,
        error,
        refreshCommunityData,
        updateCommunityData,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunityData() {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error("useCommunityData must be used within a CommunityProvider");
  }
  return context;
}
