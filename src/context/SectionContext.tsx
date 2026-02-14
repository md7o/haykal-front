"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from "react";
import { usePages } from "@/context/PagesContext";
import { AnySectionInstance } from "@/types/sections";
import { SectionType, sectionsVisualization } from "@/components/pages/portfolio-feature/sections-design/sectionsVisualization";
import { buildAvailableSections, mapSections } from "@/context/hooks/studio-utils";
import {
  saveBatchSections,
  deleteBatchSections,
  reorderSections as reorderSectionsAPI,
} from "@/api/portfolios-api/sections-endpoints";

/**
 * SectionContext: Manages sections state and operations
 * Responsibilities: Fetching sections, CRUD operations, selection, reordering, batch saving
 * Changes are tracked locally until savePendingChanges() is called
 * Used by: SectionsSidebar, DisplayPage, DrawerEditor
 */

export interface SectionContextType {
  sections: AnySectionInstance[];
  availableSections: { type: string; label: string }[];
  selectedSectionId: string | null;
  setSelectedSectionId: (id: string | null) => void;
  addSection: (type: SectionType) => void;
  updateSectionConfig: (id: string, partial: Record<string, unknown>) => void;
  removeSection: (id: string) => void;
  reorderSections: (from: number, to: number) => void;
  savePendingChanges: () => Promise<void>;
  hasPendingChanges: boolean;
  lastSavedAt: Date | null;
  isSectionsLoading: boolean;
  syncError: string | null;
}

const SectionContext = createContext<SectionContextType | undefined>(undefined);

export function SectionProvider({ children }: { children: ReactNode }) {
  const { selectedPageId, pages } = usePages();
  const [sections, setSections] = useState<AnySectionInstance[]>([]);
  const [originalSections, setOriginalSections] = useState<AnySectionInstance[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [availableSections] = useState<{ type: string; label: string }[]>(() => buildAvailableSections());
  const [isSectionsLoading, setIsSectionsLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Sync sections when selected page changes
  useEffect(() => {
    if (!selectedPageId || !pages.length) {
      setSections([]);
      setOriginalSections([]);
      return;
    }

    const page = pages.find((p: any) => p.id === selectedPageId);
    if (!page) {
      setSections([]);
      setOriginalSections([]);
      return;
    }

    const mapped = mapSections((page as any)?.sections || []);
    setSections(mapped);
    setOriginalSections(mapped);
  }, [selectedPageId, pages]);

  // SECTION OPERATIONS (local changes, batch save on Save button)
  const addSection = useCallback(
    (type: SectionType): void => {
      if (!selectedPageId) return;

      const defaultConfig = sectionsVisualization[type]?.defaultConfig ?? {};
      const tempId = `temp-${Date.now()}`;
      const newSection: AnySectionInstance = {
        id: tempId,
        type,
        name: type,
        config: defaultConfig as Record<string, unknown>,
      };

      setSections((prev) => [...prev, newSection]);
    },
    [selectedPageId],
  );

  const updateSectionConfig = useCallback(
    (id: string, partial: Record<string, unknown>): void => {
      if (!selectedPageId) return;
      const section = sections.find((s) => s.id === id);
      if (!section) return;

      setSections((prev) => prev.map((s) => (s.id === id ? { ...s, config: { ...s.config, ...partial } } : s)));
    },
    [selectedPageId, sections],
  );

  const removeSection = useCallback(
    (id: string): void => {
      if (!selectedPageId) return;
      setSections((prev) => prev.filter((s) => s.id !== id));
      setSelectedSectionId((curr) => (curr === id ? null : curr));
    },
    [selectedPageId],
  );

  const reorderSections = useCallback(
    async (from: number, to: number): Promise<void> => {
      if (from === to || from < 0 || to < 0 || !selectedPageId) return;

      setSections((prev) => {
        if (from >= prev.length || to >= prev.length) return prev;
        const clone = [...prev];
        const [item] = clone.splice(from, 1);
        clone.splice(to, 0, item);
        return clone;
      });

      // Persist new order to backend (only saved sections with real UUIDs)
      try {
        const savedSectionIds = sections.filter((s) => !s.id.startsWith("temp-")).map((s) => s.id);
        if (savedSectionIds.length === 0) return;
        await reorderSectionsAPI(selectedPageId, savedSectionIds);
      } catch (err) {
        setSyncError((err as Error).message || "Failed to reorder sections");
      }
    },
    [selectedPageId, sections],
  );

  // Compute if there are pending changes (new, deleted, or modified sections)
  const hasPendingChanges = useMemo((): boolean => {
    if (!selectedPageId) return false;
    const hasNew = sections.some((s) => s.id.startsWith("temp-"));
    const hasDeleted = originalSections.some((o) => !sections.find((s) => s.id === o.id));
    const hasModified = sections.some(
      (s) =>
        !s.id.startsWith("temp-") &&
        originalSections.find((o) => o.id === s.id && JSON.stringify(o.config) !== JSON.stringify(s.config)),
    );
    return hasNew || hasDeleted || hasModified;
  }, [sections, originalSections, selectedPageId]);

  const savePendingChanges = useCallback(async (): Promise<void> => {
    if (!selectedPageId) return;

    setIsSectionsLoading(true);
    setSyncError(null);

    try {
      // Filter out header section - it's not saved with other sections
      const nonHeaderSections = sections.filter((s) => s.type !== "header");
      const originalNonHeaderSections = originalSections.filter((s) => s.type !== "header");

      const toCreate = nonHeaderSections.filter((s) => s.id.startsWith("temp-"));
      const toDelete = originalNonHeaderSections.filter((o) => !nonHeaderSections.find((s) => s.id === o.id)).map((s) => s.id);

      if (toCreate.length === 0 && toDelete.length === 0) return;

      // Batch create
      if (toCreate.length > 0) {
        const created = await saveBatchSections(
          selectedPageId,
          toCreate.map((s) => ({ type: s.type, config: s.config })),
        );

        // Replace temp IDs with real IDs
        setSections((prev) => {
          const idMap = new Map(toCreate.map((s, i) => [s.id, created[i]?.id]));
          return prev.map((s) => (idMap.has(s.id) ? { ...s, id: idMap.get(s.id)! } : s));
        });
      }

      // Batch delete
      if (toDelete.length > 0) {
        await deleteBatchSections(selectedPageId, toDelete);
      }

      setOriginalSections((prev) => nonHeaderSections.filter((s) => !s.id.startsWith("temp-")).map((s) => ({ ...s })));
      setLastSavedAt(new Date());
    } catch (err) {
      setSyncError((err as Error).message || "Failed to save sections");
      throw err;
    } finally {
      setIsSectionsLoading(false);
    }
  }, [selectedPageId, sections, originalSections]);

  return (
    <SectionContext.Provider
      value={{
        sections,
        availableSections,
        selectedSectionId,
        setSelectedSectionId,
        addSection,
        updateSectionConfig,
        removeSection,
        reorderSections,
        savePendingChanges,
        hasPendingChanges,
        lastSavedAt,
        isSectionsLoading,
        syncError,
      }}
    >
      {children}
    </SectionContext.Provider>
  );
}

export function useSection() {
  const context = useContext(SectionContext);
  if (!context) throw new Error("useSection must be inside SectionProvider");
  return context;
}
