import { sectionsVisualization } from "@/components/pages/portfolio-feature/sections-design/sectionsVisualization";
import { AnySectionInstance } from "@/types/sections";
import { Page } from "@/api/portfolios-api/pages-endpoints";

export const isHome = (p: { slug?: string | null; title?: string | null; id?: string | null }) =>
  (p.slug || "").toLowerCase() === "home" || p.title === "Home" || p.id === "home";

export const toSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$|_/g, "");

export const buildAvailableSections = () =>
  Object.values(sectionsVisualization)
    .filter((d) => (d as any).type !== "header")
    .map((d) => {
      const dd = d as { type?: unknown; label?: unknown };
      return {
        type: typeof dd.type === "string" ? dd.type : "unknown",
        label: typeof dd.label === "string" ? dd.label : "Unknown",
      };
    });

export const findPage = (pages: Page[], idOrSlug: string | null) => pages.find((p) => p.id === idOrSlug || p.slug === idOrSlug);

export const mapSections = (sections: any[]): AnySectionInstance[] =>
  sections.map((s) => ({
    id: s.id,
    type: s.type,
    name: sectionsVisualization[s.type]?.label || "Unknown",
    config: s.config,
  }));

export const inheritHeaderConfig = (pages: Page[]) => {
  for (const p of pages) {
    const pSections = (p as any).sections;
    if (!Array.isArray(pSections)) continue;
    const existingHeader = pSections.find((s: any) => s.type === "header");
    if (existingHeader?.config) return existingHeader.config;
  }
  return null;
};
