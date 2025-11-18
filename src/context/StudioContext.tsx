"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { AnySectionInstance } from "@/types/sections";
import {
  createSectionInstance,
  SectionType,
} from "@/components/pages/portfolio-feature/sections-design/registry/sections-registry";
import type { Page } from "@/api/portfolio-endpoints";
import {
  getSelectedPageId as readSelMem,
  setSelectedPageIdMemory as writeSelMem,
  getStudioState,
  patchStudioState,
  getAssetsDraft as getAssetsDraftCentral,
  setAssetsDraft as setAssetsDraftCentral,
  getSlugDraft as getSlugDraftCentral,
  setSlugDraft as setSlugDraftCentral,
  DraftPage,
} from "@/lib/studio-storage";
import { sectionsRegistry } from "@/components/pages/portfolio-feature/sections-design/registry/sections-registry";

export interface StudioContextShape {
  used: AnySectionInstance[];
  available: { type: string; label: string }[];
  addSection: (type: SectionType) => void;
  removeSection: (id: string) => void;
  reorderUsed: (from: number, to: number) => void;
  updateSectionConfig: (id: string, partial: Record<string, unknown>) => void;
  selectedSectionId: string | null;
  selectSection: (id: string | null) => void;
  selectedPageId: string | null;
  setSelectedPageId: (id: string | null) => void;
  portfolioId: string | null;
  setPortfolioId: (id: string | null) => void;
  customDesignId: string | null;
  setCustomDesignId: (id: string | null) => void;
  slug: string | null;
  setSlug: (s: string | null) => void;
  loadSections: (sections: AnySectionInstance[]) => void;
  assets: unknown | null;
  setAssets: (a: unknown | null) => void;
}

const StudioContext = createContext<StudioContextShape | undefined>(undefined);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [used, setUsed] = useState<AnySectionInstance[]>([]);
  const [available, setAvailable] = useState<{ type: string; label: string }[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
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

  // Hydrate editor sections from centralized studio storage on mount (drafts map keyed by page id)
  useEffect(() => {
    try {
      const state = getStudioState();
      const map: Record<string, Partial<Page>> = (state.drafts as any) || {};
      // Ensure a Home draft exists so we can default-select it reliably
      const keys = Object.keys(map);
      const hasHome = keys.some((k) => {
        const d = map[k];
        try {
          return String(d?.id) === "home" || String(d?.title) === "Home" || String(d?.slug ?? "").toLowerCase() === "home";
        } catch {
          return false;
        }
      });
      if (!hasHome) {
        // create a minimal home draft and persist it
        const homeDraft: DraftPage = {
          // Ensure a stable id for Home to avoid collisions with the currently selected page id
          id: "home",
          portfolioId: String(state.portfolioId ?? "draft"),
          title: "Home",
          slug: "home",
          sections: null,
          order: 0,
        };
        const nextDrafts: Record<string, DraftPage> = { ...(state.drafts || {}), ["home"]: homeDraft };
        try {
          patchStudioState({ drafts: nextDrafts });
        } catch {
          /* ignore */
        }
        // update local map to reflect new home
        map["home"] = homeDraft;
      }

      // Restore selected page id (stored centrally), otherwise prefer Home, else first available
      const storedSel = readSelMem() ?? null;
      let pickEntry: Partial<Page> | null = null;
      if (storedSel && map[storedSel]) pickEntry = map[storedSel];
      if (!pickEntry) {
        const home = Object.values(map).find(
          (d) => String(d?.slug || "").toLowerCase() === "home" || d?.title === "Home" || String(d?.id) === "home"
        );
        if (home) pickEntry = home as Partial<Page>;
      }
      if (!pickEntry) pickEntry = map[Object.keys(map)[0]] as Partial<Page>;

      const secs = pickEntry?.sections;
      if (Array.isArray(secs) && secs.length > 0) {
        // @ts-ignore minimal shape (type, config)
        loadSections(secs as any);
      }
      if (!selectedPageId && pickEntry?.id) {
        try {
          setSelectedPageId(String(pickEntry.id));
        } catch {}
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist last selected page id to a centralized storage for hydration
  useEffect(() => {
    try {
      writeSelMem(selectedPageId ?? null);
    } catch {
      // ignore
    }
  }, [selectedPageId]);

  // Note: We no longer hydrate from a global draft (studioUsed). Per-page drafts live under studioDraftPages.

  // Hydrate stored ids (portfolioId, customDesignId) from sessionStorage on mount
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const pid = sessionStorage.getItem("portfolioId");
      // legacy: some older tabs may have written customDesignId; prefer portfolioId
      const cid = sessionStorage.getItem("customDesignId");
      if (pid) {
        _setPortfolioId(pid);
        _setCustomDesignId(pid);
      } else if (cid) {
        // fallback for older tabs: hydrate both from the legacy key
        _setPortfolioId(cid);
        _setCustomDesignId(cid);
      }
    } catch {
      // ignore
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

  // We no longer persist a global 'studioUsed'. All persistence is handled per-page in PagesSidebar.

  // Hydrate only draft assets from centralized storage on mount (ids are resolved from auth)
  useEffect(() => {
    try {
      const assetsDraft = getAssetsDraftCentral();
      if (assetsDraft !== undefined) _setAssets(assetsDraft ?? null);
      const slugDraft = getSlugDraftCentral();
      if (slugDraft !== undefined && slugDraft !== null) _setSlug(slugDraft);
    } catch {
      // ignore
    }
  }, []);

  // persist assets draft to sessionStorage when assets change
  useEffect(() => {
    try {
      setAssetsDraftCentral(assets ?? null);
    } catch {}
  }, [assets]);

  const setPortfolioId = useCallback((id: string | null) => {
    _setPortfolioId(id);
    // Keep design id in-sync (canonical model: design is attached to portfolio)
    _setCustomDesignId(id);
    try {
      if (typeof window !== "undefined") {
        if (id) sessionStorage.setItem("portfolioId", id);
        else sessionStorage.removeItem("portfolioId");
        // NOTE: we intentionally do NOT write `customDesignId` anymore —
        // portfolioId is the single canonical key for cross-tab sync
      }
    } catch {
      // ignore
    }
  }, []);

  const setCustomDesignId = useCallback((id: string | null) => {
    // Keep backwards-compatible API: delegate to setPortfolioId so both stay in-sync.
    setPortfolioId(id);
  }, []);

  const setSlug = useCallback((s: string | null) => {
    _setSlug(s);
    try {
      setSlugDraftCentral(s ?? null);
    } catch {}
  }, []);

  const setAssets = useCallback((a: unknown | null) => {
    _setAssets(a);
    try {
      setAssetsDraftCentral(a ?? null);
    } catch {}
  }, []);

  const loadSections = useCallback((sections: AnySectionInstance[]) => {
    try {
      if (!Array.isArray(sections)) return;
      const normalized = sections.map((s) => {
        try {
          // If a valid instance shape comes in, preserve it as-is to keep ids stable
          if (
            s &&
            typeof (s as any).id === "string" &&
            (s as any).id.length > 0 &&
            typeof (s as any).type === "string" &&
            (s as any).type.length > 0
          )
            return s;
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
      setUsed((prev) => {
        try {
          const prevSimple = prev.map((p) => ({ type: p.type, config: p.config }));
          const newSimple = normalized.map((n) => ({ type: n.type, config: n.config }));
          // simple deep-equality check to avoid unnecessary state churn
          if (JSON.stringify(prevSimple) === JSON.stringify(newSimple)) return prev;
        } catch {
          // fallthrough to set
        }
        return normalized;
      });
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
        selectedPageId,
        setSelectedPageId,
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
