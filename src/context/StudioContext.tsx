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
}

const StudioContext = createContext<StudioContextShape | undefined>(undefined);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [used, setUsed] = useState<AnySectionInstance[]>([]);
  const [available, setAvailable] = useState<{ type: string; label: string }[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [portfolioId, _setPortfolioId] = useState<string | null>(null);
  const [customDesignId, _setCustomDesignId] = useState<string | null>(null);

  // Initialize available sections once registry is available
  useEffect(() => {
    try {
      if (sectionsRegistry && typeof sectionsRegistry === "object") {
        const list = Object.values(sectionsRegistry).map((d) => {
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

  // Hydrate IDs from sessionStorage on mount (if present)
  useEffect(() => {
    try {
      const p = typeof window !== "undefined" ? sessionStorage.getItem("portfolioId") : null;
      const c = typeof window !== "undefined" ? sessionStorage.getItem("customDesignId") : null;
      if (p) _setPortfolioId(p);
      if (c) _setCustomDesignId(c);
    } catch {
      // ignore
    }
  }, []);

  const setPortfolioId = useCallback((id: string | null) => {
    _setPortfolioId(id);
    try {
      if (typeof window !== "undefined") {
        if (id) sessionStorage.setItem("portfolioId", id);
        else sessionStorage.removeItem("portfolioId");
      }
    } catch {
      // ignore
    }
  }, []);

  const setCustomDesignId = useCallback((id: string | null) => {
    _setCustomDesignId(id);
    try {
      if (typeof window !== "undefined") {
        if (id) sessionStorage.setItem("customDesignId", id);
        else sessionStorage.removeItem("customDesignId");
      }
    } catch {
      // ignore
    }
  }, []);

  const addSection = useCallback((type: SectionType) => {
    const instance = createSectionInstance(type);
    setUsed((prev) => [...prev, instance]);
  }, []);

  const removeSection = useCallback((id: string) => {
    setUsed((prev) => prev.filter((s) => s.id !== id));
    setSelectedSectionId((curr) => (curr === id ? null : curr));
  }, []);

  const reorderUsed = useCallback((from: number, to: number) => {
    setUsed((prev) => {
      if (from === to || from < 0 || to < 0 || from >= prev.length || to >= prev.length) return prev;
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
