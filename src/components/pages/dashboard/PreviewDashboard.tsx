"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sectionsRegistry } from "@/components/pages/portfolio-feature/sections-design/registry/sections-registry";
import { useStudio } from "@/context/StudioContext";
import { getCustomDesignById, getPortfolioBySlug, getPortfolioById, getPages, type Page } from "@/api/portfolio-endpoints";
import { IconButton } from "@/components/ui-tools/ui/button";
import { RefreshCw, MonitorSmartphone, Smartphone, Eye } from "lucide-react";
import { Button } from "@/components/ui-tools/ui/button";
import PortfolioTheme from "@/components/theme/PortfolioTheme";
import { useAuth } from "@/context/AuthContext";
import { resolveUserPortfolioId } from "@/lib/portfolio-helpers";
import { getDraftsMap as getDraftsMapCentral } from "@/lib/studio-storage";
import { Spinner } from "@/components/ui-tools/ui/spinner";

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
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<Date | null>(null);
  const [themeInfo, setThemeInfo] = useState<{ paletteName?: string; primary?: string; secondary?: string; font?: string }>({});
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const headerContainerRef = useRef<HTMLDivElement | null>(null);

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
      // fetch custom design and pages for this portfolio
      const [data, remotePages] = await Promise.all([getCustomDesignById(id), getPages(id).catch(() => [])]);
      // assets live at portfolio level
      setAssets(data?.assets ?? null);
      setPages(remotePages || []);

      // choose default selected page: prefer Home, else first remote page
      const home = (remotePages || []).find(
        (p) => (p.slug || "").toLowerCase() === "home" || p.title === "Home" || p.id === "home"
      );
      const defaultPageId = home ? home.id : (remotePages || [])[0]?.id ?? null;
      setSelectedPageId(defaultPageId);
      // set initial sections from chosen page
      const initialPage = (remotePages || []).find((p) => p.id === defaultPageId) || null;
      const normalized = normalizeSections(initialPage?.sections ?? []);
      setSections(normalized);
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

  // When selectedPageId changes, load that page's sections into preview
  useEffect(() => {
    if (!resolvedId || !selectedPageId) return;
    (async () => {
      try {
        const all = await getPages(resolvedId);
        const p = all.find((pg) => pg.id === selectedPageId) ?? all.find((pg) => (pg.slug || "").toLowerCase() === "home");
        const normalized = normalizeSections(p?.sections ?? []);
        setSections(normalized);
      } catch {
        // ignore
      }
    })();
  }, [selectedPageId, resolvedId, normalizeSections]);

  useEffect(() => {
    if (isCheckingAuth) return;
    load();
  }, [load, isCheckingAuth]);

  // Intercept header nav clicks (anchors) and map them to page selection
  useEffect(() => {
    const el = headerContainerRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // find anchor element
      const anchor = target.closest && (target.closest("a") as HTMLAnchorElement | null);
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      if (!href.startsWith("#")) return; // only handle fragment links
      e.preventDefault();
      const slug = href.slice(1);

      // try find page by slug or title locally first
      const foundLocal = pages.find(
        (p) => (p.slug || "").toLowerCase() === slug.toLowerCase() || String(p.title || "").toLowerCase() === slug.toLowerCase()
      );
      if (foundLocal) {
        setSelectedPageId(foundLocal.id);
        return;
      }

      // If not found locally, try to fetch latest pages from the network (use resolvedId)
      if (!resolvedId) return;
      (async () => {
        try {
          const remote = await getPages(resolvedId);
          if (!remote || !Array.isArray(remote)) return;
          // update local pages list with fresh remote data
          setPages(remote || []);
          const foundRemote = remote.find(
            (p) =>
              (p.slug || "").toLowerCase() === slug.toLowerCase() || String(p.title || "").toLowerCase() === slug.toLowerCase()
          );
          if (foundRemote) setSelectedPageId(foundRemote.id);
        } catch {
          // ignore network errors
        }
      })();
    };
    el.addEventListener("click", handler as EventListener);
    return () => el.removeEventListener("click", handler as EventListener);
  }, [pages, sections, setSelectedPageId, resolvedId]);

  // If a header section exists but we have no pages yet, try to fetch remote pages once
  useEffect(() => {
    // only attempt when we have resolvedId, no pages, and header section present
    const hasHeader = sections.some((s) => s.type === "header");
    if (!hasHeader) return;
    if (!resolvedId) return;
    if (pages && pages.length > 0) return;

    let mounted = true;
    (async () => {
      try {
        const remote = await getPages(resolvedId);
        if (!mounted) return;
        if (remote && Array.isArray(remote) && remote.length > 0) setPages(remote);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [sections, resolvedId, pages]);

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
        {/* pages are rendered inside the portfolio header (if present) */}
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
                {/* Render header design if present and active (header is part of the sections array) */}
                {(() => {
                  const headerDef = sectionsRegistry["header"];
                  if (!headerDef) return null;
                  // find header section from normalized sections
                  const headerInst = sections.find((s) => s.type === "header");
                  if (!headerInst) return null;
                  const cfg = { ...(headerInst.config as any) };
                  const isActive = cfg?.active !== false;
                  if (!isActive) return null;
                  // Build pages list for header nav: merge server pages with local drafts (map-aware)
                  // Prefer remote pages when slug/title collide, and avoid duplicate nav entries
                  let draftsForHeader: Array<{ id: string; title: string; slug?: string | null; order?: number }> = [];
                  try {
                    const map = getDraftsMapCentral();
                    draftsForHeader = Object.values(map || {}).map((p: any) => ({
                      id: String(p.id),
                      title: p.title || "New Page",
                      slug: p.slug ?? "",
                      order: p.order,
                    }));
                  } catch {
                    /* ignore */
                  }

                  // Build a key that prefers slug if present, else title, else id
                  const keyFor = (p: { id: string; title?: string | null; slug?: string | null }) => {
                    const s = (p.slug || "").trim();
                    if (s) return s.toLowerCase();
                    const t = String(p.title || "").trim();
                    if (t) return t.toLowerCase();
                    return p.id;
                  };

                  // First add remote pages (authoritative), then add drafts only if their key isn't present
                  const mergedByKey = new Map<string, { id: string; title: string; slug?: string | null; order?: number }>();
                  for (const p of pages) {
                    const key = keyFor({ id: p.id, title: p.title, slug: p.slug });
                    mergedByKey.set(key, { id: p.id, title: p.title, slug: p.slug, order: p.order });
                  }
                  for (const p of draftsForHeader) {
                    const key = keyFor(p);
                    if (!mergedByKey.has(key)) mergedByKey.set(key, p);
                  }

                  const mergedList = Array.from(mergedByKey.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                  const cfgWithPages = { ...cfg, pages: mergedList };
                  return (
                    <div ref={headerContainerRef} className="">
                      <headerDef.Design config={cfgWithPages} view={view} />
                    </div>
                  );
                })()}

                {/* Main content (exclude header sections from list) */}
                {sections.filter((s) => s.type !== "header").length === 0 && (
                  <div className="flex-1 flex items-center justify-center p-6 text-sm text-description text-center">
                    No sections published yet.
                  </div>
                )}

                {!!sections.filter((s) => s.type !== "header").length &&
                  (() => {
                    const bodySections = sections.filter((s) => s.type !== "header");
                    return (
                      <div className={` ${view === "desktop" ? "first:mt-0" : "first:mt-24"} last:mb-10 space-y-24`}>
                        {bodySections.map((sec, idx) => (
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
