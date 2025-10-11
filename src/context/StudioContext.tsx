"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { AnySectionInstance } from "@/types/sections";
import { createSectionInstance, SectionType } from "@/components/pages/sections-design/registry/sections-registry";
import { sectionsRegistry } from "@/components/pages/sections-design/registry/sections-registry";

export interface StudioContextShape {
  used: AnySectionInstance[];
  available: { type: string; label: string }[];
  addSection: (type: SectionType) => void;
  removeSection: (id: string) => void;
  reorderUsed: (from: number, to: number) => void;
  updateSectionConfig: (id: string, partial: Record<string, unknown>) => void;
  selectedSectionId: string | null;
  selectSection: (id: string | null) => void;
  portfolioId: string | null;
  setPortfolioId: (id: string | null) => void;
  customDesignId: string | null;
  setCustomDesignId: (id: string | null) => void;
  slug: string | null;
  setSlug: (s: string | null) => void;
  // Replace current used sections with the provided list (hydrate from backend)
  loadSections: (sections: AnySectionInstance[]) => void;
  assets: unknown | null;
  setAssets: (a: unknown | null) => void;
}

const StudioContext = createContext<StudioContextShape | undefined>(undefined);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [used, setUsed] = useState<AnySectionInstance[]>([]);
  const [available, setAvailable] = useState<{ type: string; label: string }[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [portfolioId, _setPortfolioId] = useState<string | null>(null);
  const [customDesignId, _setCustomDesignId] = useState<string | null>(null);
  const [slug, _setSlug] = useState<string | null>(null);
  const [assets, _setAssets] = useState<unknown | null>(null);

  // Initialize available sections once registry is available
  useEffect(() => {
    try {
      if (sectionsRegistry && typeof sectionsRegistry === "object") {
        const list = Object.values(sectionsRegistry)
          // Header is managed separately in the UI
          .filter((d) => (d as any).type !== "header")
          .map((d) => {
            const dd = d as { type?: unknown; label?: unknown };
            return {
              type: typeof dd.type === "string" ? dd.type : "unknown",
              label: typeof dd.label === "string" ? dd.label : "Unknown",
            };
          });
        setAvailable(list);
      }
    } catch {
      // noop: keep empty to avoid crashing
    }
  }, []);

  // Hydrate used sections from sessionStorage (draft) on mount
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = sessionStorage.getItem("studioUsed");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setUsed(parsed as AnySectionInstance[]);
      }
    } catch {
      // ignore hydration errors
    }
  }, []);

  // If a header exists, ensure exactly one and pin it at index 0; do NOT auto-create one
  useEffect(() => {
    try {
      setUsed((prev) => {
        const headers = prev.filter((s) => s.type === "header");
        let next: AnySectionInstance[] = prev;
        if (headers.length > 0) {
          // Keep only the first header and move it to the top
          const firstHeaderIndex = prev.findIndex((s) => s.type === "header");
          const firstHeader = prev[firstHeaderIndex];
          const withoutHeaders = prev.filter((s) => s.type !== "header");
          next = [firstHeader, ...withoutHeaders];
        }

        // Avoid state churn if nothing effectively changed (ids in same order)
        const unchanged = next.length === prev.length && next.every((item, idx) => item.id === prev[idx]?.id);
        return unchanged ? prev : next;
      });
    } catch {
      // ignore
    }
  }, [used]);

  // Persist used sections as a draft in sessionStorage
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (used && used.length) sessionStorage.setItem("studioUsed", JSON.stringify(used));
      else sessionStorage.removeItem("studioUsed");
    } catch {
      // ignore persistence errors
    }
  }, [used]);

  // Hydrate only draft assets from sessionStorage on mount (ids are resolved from auth)
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? sessionStorage.getItem("designAssetsDraft") : null;
      if (raw) _setAssets(JSON.parse(raw));
      const rawSlug = typeof window !== "undefined" ? sessionStorage.getItem("portfolioSlugDraft") : null;
      if (rawSlug) _setSlug(rawSlug);
    } catch {
      // ignore
    }
  }, []);

  // persist assets draft to sessionStorage when assets change
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (assets) sessionStorage.setItem("designAssetsDraft", JSON.stringify(assets));
      else sessionStorage.removeItem("designAssetsDraft");
    } catch {
      // ignore
    }
  }, [assets]);

  const setPortfolioId = useCallback((id: string | null) => {
    _setPortfolioId(id);
  }, []);

  const setCustomDesignId = useCallback((id: string | null) => {
    _setCustomDesignId(id);
  }, []);

  const setSlug = useCallback((s: string | null) => {
    _setSlug(s);
    try {
      if (typeof window !== "undefined") {
        if (s) sessionStorage.setItem("portfolioSlugDraft", String(s));
        else sessionStorage.removeItem("portfolioSlugDraft");
      }
    } catch {
      // ignore
    }
  }, []);

  const setAssets = useCallback((a: unknown | null) => {
    _setAssets(a);
    try {
      if (typeof window !== "undefined") {
        if (a) sessionStorage.setItem("designAssetsDraft", JSON.stringify(a));
        else sessionStorage.removeItem("designAssetsDraft");
      }
    } catch {
      // ignore
    }
  }, []);

  const loadSections = useCallback((sections: AnySectionInstance[]) => {
    try {
      if (!Array.isArray(sections)) return;
      const normalized = sections.map((s) => {
        try {
          if (s && typeof (s as any).id === "string" && typeof (s as any).type === "string") return s;
        } catch {
          /* fallthrough */
        }
        // if the server payload is malformed, create a fresh instance preserving config when possible
        const t = (s as any)?.type || ("text" as SectionType);
        const inst = createSectionInstance(t as SectionType);
        try {
          if (s && typeof (s as any).config === "object")
            inst.config = { ...inst.config, ...((s as any).config as Record<string, unknown>) };
        } catch {
          // ignore
        }
        return inst;
      });
      setUsed(normalized);
    } catch {
      // ignore
    }
  }, []);

  const addSection = useCallback((type: SectionType) => {
    const instance = createSectionInstance(type);
    setUsed((prev) => {
      if (type === "header") {
        // Avoid duplicates; if header exists, keep current order (header is pinned by effect)
        if (prev.some((s) => s.type === "header")) return prev;
        return [instance, ...prev];
      }
      return [...prev, instance];
    });
  }, []);

  const removeSection = useCallback((id: string) => {
    setUsed((prev) => prev.filter((s) => s.id !== id));
    setSelectedSectionId((curr) => (curr === id ? null : curr));
  }, []);

  const reorderUsed = useCallback((from: number, to: number) => {
    setUsed((prev) => {
      if (from === to || from < 0 || to < 0 || from >= prev.length || to >= prev.length) return prev;
      // Prevent moving header or moving other items into header position
      const isHeaderFrom = prev[from]?.type === "header";
      const isHeaderTo = prev[to]?.type === "header";
      if (isHeaderFrom || isHeaderTo) return prev;
      const clone = [...prev];
      const [item] = clone.splice(from, 1);
      clone.splice(to, 0, item);
      return clone;
    });
  }, []);

  const updateSectionConfig = useCallback((id: string, partial: Record<string, unknown>) => {
    setUsed((prev) =>
      prev.map((s) => (s.id === id ? { ...s, config: { ...s.config, ...(partial as Record<string, unknown>) } } : s))
    );
  }, []);

  const selectSection = useCallback((id: string | null) => setSelectedSectionId(id), []);

  return (
    <StudioContext.Provider
      value={{
        used,
        available,
        addSection,
        removeSection,
        reorderUsed,
        updateSectionConfig,
        selectedSectionId,
        selectSection,
        portfolioId,
        setPortfolioId,
        customDesignId,
        setCustomDesignId,
        slug,
        setSlug,
        loadSections,
        assets,
        setAssets,
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
