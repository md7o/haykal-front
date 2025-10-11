"use client";

import { createContext, useCallback, useEffect, useMemo, useRef, useState, useContext, ReactNode } from "react";
import { getCustomDesignById } from "@/api/portfolio-endpoints";
import { sectionsRegistry } from "@/components/pages/sections-design/registry/sections-registry";

type SectionItem = { id?: string; type: string; config: unknown };

export interface PublishedDesignContextShape {
  designId: string | null;
  portfolioId: string | null;
  sections: SectionItem[];
  assets: any | null;
  loading: boolean;
  error: string | null;
  lastLoadedAt: Date | null;
  setDesignId: (id: string | null) => void;
  setPortfolioId: (id: string | null) => void;
  refresh: () => Promise<void>;
}

const PublishedDesignContext = createContext<PublishedDesignContextShape | undefined>(undefined);

function safeGetSession(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetSession(key: string, value: string | null) {
  try {
    if (typeof window === "undefined") return;
    if (value == null || value === "") sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function normalizeSections(raw: unknown): SectionItem[] {
  let arr: unknown = raw;
  if (typeof arr === "string") {
    try {
      arr = JSON.parse(arr);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item: unknown, index) => {
      if (!item || typeof item !== "object") return null;
      const anyItem = item as { id?: string; type?: unknown; config?: unknown };
      const type = typeof anyItem.type === "string" ? anyItem.type : undefined;
      if (!type) return null;
      const def = (sectionsRegistry as any)[type];
      const config = anyItem.config && typeof anyItem.config === "object" ? anyItem.config : def?.defaultConfig || {};
      return { id: anyItem.id || `idx-${index}`, type, config } as SectionItem;
    })
    .filter(Boolean) as SectionItem[];
}

export function PublishedDesignProvider({ children }: { children: ReactNode }) {
  const [designId, _setDesignId] = useState<string | null>(null);
  const [portfolioId, _setPortfolioId] = useState<string | null>(null);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [assets, setAssets] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<Date | null>(null);

  // Bootstrap IDs from sessionStorage on mount
  useEffect(() => {
    const d = safeGetSession("customDesignId");
    const p = safeGetSession("portfolioId");
    if (d) _setDesignId(d);
    if (p) _setPortfolioId(p);
  }, []);

  // Keep sessionStorage in sync for cross-tab coherence
  useEffect(() => {
    safeSetSession("customDesignId", designId);
  }, [designId]);
  useEffect(() => {
    safeSetSession("portfolioId", portfolioId);
  }, [portfolioId]);

  // Listen to external changes (other tabs, StudioContext updates)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== sessionStorage) return;
      if (e.key === "customDesignId") _setDesignId(e.newValue);
      if (e.key === "portfolioId") _setPortfolioId(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const resolvingRef = useRef<Promise<void> | null>(null);

  const resolveDesignIdIfNeeded = useCallback(async () => {
    // unified model: design is on the portfolio row; ids are the same
    if (designId || !portfolioId) return;
    _setDesignId(portfolioId);
  }, [designId, portfolioId]);

  const fetchDesign = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomDesignById(id);
      const normalized = normalizeSections(data?.sections);
      setSections(normalized);
      setAssets(data?.assets ?? null);
      setLastLoadedAt(new Date());
    } catch (e: any) {
      setError(e?.message || "Failed to load design");
      setSections([]);
      setAssets(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!designId) return;
    await fetchDesign(designId);
  }, [designId, fetchDesign]);

  // Resolve and fetch whenever ids change
  useEffect(() => {
    // Avoid overlapping resolve/fetch cycles
    const run = async () => {
      if (!designId) await resolveDesignIdIfNeeded();
      if (designId) await fetchDesign(designId);
    };
    resolvingRef.current = run();
    return () => {
      // best-effort: cannot cancel promises; rely on last write wins
    };
  }, [designId, portfolioId, resolveDesignIdIfNeeded, fetchDesign]);

  const setDesignId = useCallback((id: string | null) => {
    _setDesignId(id);
  }, []);
  const setPortfolioId = useCallback((id: string | null) => {
    _setPortfolioId(id);
  }, []);

  const value = useMemo<PublishedDesignContextShape>(
    () => ({ designId, portfolioId, sections, assets, loading, error, lastLoadedAt, setDesignId, setPortfolioId, refresh }),
    [designId, portfolioId, sections, assets, loading, error, lastLoadedAt, setDesignId, setPortfolioId, refresh]
  );

  return <PublishedDesignContext.Provider value={value}>{children}</PublishedDesignContext.Provider>;
}

export function usePublishedDesign() {
  const ctx = useContext(PublishedDesignContext);
  if (!ctx) throw new Error("usePublishedDesign must be used inside PublishedDesignProvider");
  return ctx;
}
