import { useState, useCallback } from "react";
import { AnySectionInstance } from "@/types/sections";
import { sectionsVisualization, SectionType } from "@/components/pages/portfolio-feature/sections-design/sectionsVisualization";
import { inheritHeaderConfig } from "./studio-utils";
import { Page } from "@/api/portfolios-api/pages-endpoints";

export function useStudioSections(
  selectedPageId: string | null,
  pages: Page[],
  refreshPortfolioData: () => Promise<void>,
  markDirty: () => void
) {
  const [used, setUsed] = useState<AnySectionInstance[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const addSection = useCallback(
    async (type: SectionType) => {
      const def = sectionsVisualization[type];
      if (!def) return;

      const inherited = type === "header" ? inheritHeaderConfig(pages) : null;
      const initialConfig = { ...(def.defaultConfig as Record<string, unknown>), ...(inherited ?? {}) };

      const tempId = crypto.randomUUID();
      const tempSection: AnySectionInstance = {
        id: tempId,
        type,
        name: def.label,
        config: initialConfig,
      };

      setUsed((prev) => {
        if (type === "header") {
          if (prev.some((s) => s.type === "header")) return prev;
          return [tempSection, ...prev];
        }
        return [...prev, tempSection];
      });

      if (!selectedPageId) return;

      // Defer persistence; mark dirty so bulk save can flush later
      markDirty();
    },
    [selectedPageId, pages, markDirty]
  );

  const removeSection = useCallback(
    async (id: string) => {
      setUsed((prev) => prev.filter((s) => s.id !== id));
      setSelectedSectionId((curr) => (curr === id ? null : curr));

      if (!selectedPageId) return;

      markDirty();
    },
    [selectedPageId, markDirty]
  );

  const reorderUsed = useCallback(
    async (from: number, to: number) => {
      let newOrder: AnySectionInstance[] = [];
      setUsed((prev) => {
        if (from === to || from < 0 || to < 0 || from >= prev.length || to >= prev.length) return prev;
        const isHeaderFrom = prev[from]?.type === "header";
        const isHeaderTo = prev[to]?.type === "header";
        if (isHeaderFrom || isHeaderTo) return prev;

        const clone = [...prev];
        const [item] = clone.splice(from, 1);
        clone.splice(to, 0, item);
        newOrder = clone;
        return clone;
      });

      if (!selectedPageId) return;

      if (newOrder.length > 0) {
        markDirty();
      }
    },
    [selectedPageId, markDirty]
  );

  const updateSectionConfig = useCallback(
    async (id: string, partial: Record<string, unknown>) => {
      setUsed((prev) => prev.map((s) => (s.id === id ? { ...s, config: { ...s.config, ...partial } } : s)));

      if (!selectedPageId) return;

      markDirty();
    },
    [selectedPageId, used, pages, markDirty]
  );

  return {
    used,
    setUsed,
    selectedSectionId,
    selectSection: setSelectedSectionId,
    addSection,
    removeSection,
    reorderUsed,
    updateSectionConfig,
  };
}
