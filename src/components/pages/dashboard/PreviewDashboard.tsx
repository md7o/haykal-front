"use client";

import { useCallback, useEffect, useState } from "react";
import { sectionsRegistry } from "@/components/pages/sections-design/registry/sections-registry";
import { useStudio } from "@/context/StudioContext";
import { getCustomDesignById, getPortfolioBySlug, getPortfolioById } from "@/api/portfolio-endpoints";
import { IconButton } from "@/components/ui/button";
import { RefreshCw, MonitorSmartphone, Smartphone, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import PortfolioTheme from "@/components/theme/PortfolioTheme";
import { useAuth } from "@/context/AuthContext";
import { resolveUserPortfolioId } from "@/lib/portfolio-helpers";
import { Spinner } from "@/components/ui/spinner";

type SectionItem = { id?: string; type: string; config: unknown };

function SectionRenderer({ sec, idx, view }: { sec: SectionItem; idx: number; view: "desktop" | "mobile" }) {
  const def = sectionsRegistry[sec.type as keyof typeof sectionsRegistry];
  if (!def) return <div className="border mb-4 rounded p-4 bg-red-50 text-sm text-red-600">Unknown section type: {sec.type}</div>;
  const Design = def.Design;
  return (
    <div>
      <Design config={sec.config} view={view} />
    </div>
  );
}

function applyAssetsToDom(assets: any) {
  if (typeof window === "undefined" || !assets) return;
  try {
    const root = document.documentElement.style;
    const palette = assets.palette || {};
    const font = assets.font;
    const primary = (palette.primary || "").trim();
    const secondary = (palette.secondary || "").trim();
    if (primary) root.setProperty("--portfolio-accent-cus", primary);
    if (secondary) {
      root.setProperty("--portfolio-card-bg-cus", secondary);
      root.setProperty("--portfolio-secondary-card-cus", secondary);
      if (!root.getPropertyValue("--portfolio-background-cus")) root.setProperty("--portfolio-background-cus", secondary);
    }
    if (font) {
      document.documentElement.style.setProperty("--font-montserrat-cus", font);
      document.body.style.setProperty("--font-montserrat-cus", font);
    }
  } catch {
    /* ignore */
  }
}
export default function PreviewDashboard() {
  const { portfolioId, slug } = useStudio();
  const { user, isCheckingAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [assets, setAssets] = useState<any | null>(null);
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<Date | null>(null);
  const [themeInfo, setThemeInfo] = useState<{ paletteName?: string; primary?: string; secondary?: string; font?: string }>({});
  const [view, setView] = useState<"desktop" | "mobile">("desktop");

  const normalizeSections = useCallback((raw: unknown): SectionItem[] => {
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
        const def = sectionsRegistry[type];
        const config = anyItem.config && typeof anyItem.config === "object" ? anyItem.config : def?.defaultConfig || {};
        return { id: anyItem.id || `idx-${index}`, type, config } as SectionItem;
      })
      .filter(Boolean) as SectionItem[];
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let id = portfolioId || null;
      if (!id) {
        const userId = (user as any)?.userId || (user as any)?.id;
        if (!userId) throw new Error("Please sign in to view your portfolio preview.");
        id = (await resolveUserPortfolioId(String(userId))) || null;
        if (!id) throw new Error("No portfolio found for this user.");
      }
      setResolvedId(id);
      const data = await getCustomDesignById(id);
      const normalized = normalizeSections(data?.sections);
      setSections(normalized);
      setAssets(data?.assets ?? null);
      setLastLoadedAt(new Date());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load design";
      setError(msg);
      setSections([]);
      setAssets(null);
      setResolvedId(null);
    } finally {
      setLoading(false);
    }
  }, [portfolioId, normalizeSections, user]);

  useEffect(() => {
    if (isCheckingAuth) return;
    load();
  }, [load, isCheckingAuth]);

  // Apply theme when assets change
  useEffect(() => {
    if (!assets) {
      setThemeInfo({});
      return;
    }
    applyAssetsToDom(assets);
    try {
      const palette = (assets as any).palette || {};
      const font = (assets as any).font;
      setThemeInfo({
        paletteName: palette.name || (palette.primary ? "Custom" : "Default"),
        primary: palette.primary,
        secondary: palette.secondary,
        font,
      });
    } catch {
      /* ignore */
    }
  }, [assets]);

  const handleRefresh = () => load();

  const handleVisitSite = async () => {
    try {
      // Prefer slug if it resolves; fallback to id
      let urlPart: string | null = null;

      // If a slug prop exists, prefer verifying it first
      if (slug) {
        try {
          const maybe = await getPortfolioBySlug(String(slug));
          if (maybe) {
            urlPart = String(slug);
          }
        } catch {
          // ignore and fallback to id resolution
        }
      }

      // If slug not usable, try to resolve using portfolioId or user's portfolio and prefer backend slug if present
      if (!urlPart) {
        let id = portfolioId || null;
        const userId = (user as any)?.userId || (user as any)?.id;
        if (!id && !userId) {
          setError("Please sign in to view your portfolio preview.");
          return;
        }
        if (!id && userId) id = (await resolveUserPortfolioId(String(userId))) || null;
        if (!id) return setError("No portfolio found for this user.");

        try {
          const p = await getPortfolioById(String(id));
          urlPart = p && p.slug ? String(p.slug) : String(id);
        } catch {
          urlPart = String(id);
        }
      }

      // open in new tab using verified slug or fallback id
      window.open(`/portfolio/${urlPart}`, "_blank");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to resolve portfolio id";
      setError(msg);
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Spinner className="mx-auto text-white size-6" />
      </div>
    );
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-3 ">
        <div className="hidden md:flex gap-1">
          <Button
            variant={view === "desktop" ? "fill" : "grayFill"}
            size="small"
            onClick={() => setView("desktop")}
            aria-label="Desktop view"
            className="gap-1"
          >
            <MonitorSmartphone className="w-4 h-4" />
            <span className="text-xs">Desktop</span>
          </Button>
          <Button
            variant={view === "mobile" ? "fill" : "grayFill"}
            size="small"
            onClick={() => setView("mobile")}
            aria-label="Mobile view"
            className="gap-1"
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-xs">Mobile</span>
          </Button>
        </div>
        <div className="flex items-center gap-4">
          {themeInfo && (
            <div className="hidden md:flex items-center gap-3 px-5 py-3 bg-white rounded-soft">
              <div className="flex items-center gap-3">
                {themeInfo.primary && (
                  <div className="flex items-center gap-2">
                    <div
                      className="inline-block w-6 h-6 rounded-full"
                      style={{ background: themeInfo.primary }}
                      aria-label={`Primary color ${themeInfo.primary}`}
                      title={themeInfo.primary}
                    />
                    <span className="text-xs text-description hidden lg:inline">{themeInfo.primary}</span>
                  </div>
                )}

                <div className="w-[1px] h-5 bg-card-bg" />

                {themeInfo.secondary && (
                  <div className="flex items-center gap-2">
                    <div
                      className="inline-block w-6 h-6 rounded-full"
                      style={{ background: themeInfo.secondary }}
                      aria-label={`Secondary color ${themeInfo.secondary}`}
                      title={themeInfo.secondary}
                    />
                    <span className="text-xs text-description hidden lg:inline">{themeInfo.secondary}</span>
                  </div>
                )}
                <div className="w-[1px] h-5 bg-card-bg" />
              </div>

              {themeInfo.font && (
                <>
                  <span className="text-xs">font:</span>
                  <span className="text-base text-description" title={themeInfo.font} style={{ fontFamily: themeInfo.font }}>
                    {String(themeInfo.font).split(",")[0].replace(/"/g, "")}
                  </span>
                </>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <IconButton variant="grayFill" size="small" onClick={handleRefresh} aria-label="Refresh preview" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </IconButton>
            <IconButton variant="fill" size="small" onClick={handleVisitSite} aria-label="Refresh preview" className="gap-2">
              <Eye className="w-4 h-4" /> Visit Site
            </IconButton>
          </div>
        </div>
      </div>

      {/* Preview surface */}
      <div className="flex-1">
        {/* <span className="text-xs text-description">preview id: {resolvedId ?? portfolioId ?? "—"}</span> */}

        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="relative w-full h-full">
            <PortfolioTheme
              assets={assets}
              className={`${view === "mobile" ? "md:max-w-[430px] md:mx-auto w-full h-full" : "w-full h-full"}`}
            >
              <div className="relative flex flex-col overflow-hidden w-full h-full">
                {!sections.length && (
                  <div className="flex-1 flex items-center justify-center p-6 text-sm text-description text-center">
                    No sections published yet.
                  </div>
                )}
                {!!sections.length &&
                  (() => {
                    const headerIsFirst = sections[0]?.type === "header";
                    return (
                      <div className={`${headerIsFirst ? "first:mt-0" : "first:mt-24"} last:mb-10 space-y-24`}>
                        {sections.map((sec, idx) => (
                          <SectionRenderer key={sec.id || idx} sec={sec} idx={idx} view={view} />
                        ))}
                      </div>
                    );
                  })()}
              </div>
            </PortfolioTheme>
          </div>
        </div>
      </div>
    </div>
  );
}
