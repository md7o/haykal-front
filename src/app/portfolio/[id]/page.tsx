"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getCustomDesignById, getPortfolioBySlug } from "@/api/portfolio-endpoints";
import { sectionsRegistry } from "@/components/pages/sections-design/registry/sections-registry";
import PortfolioTheme from "@/components/theme/PortfolioTheme";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { CircleUser, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

type SectionItem = { id?: string; type: string; config: unknown };

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

function SectionRenderer({ sec, idx }: { sec: SectionItem; idx: number }) {
  const def = sectionsRegistry[sec.type as keyof typeof sectionsRegistry];
  if (!def)
    return (
      <div key={idx} className="border mb-4 rounded p-4 bg-red-50 text-sm text-red-600">
        Unknown section type: {sec.type}
      </div>
    );
  const Design = def.Design;
  return (
    <div key={idx} className="my-24 first:mt-0 last:mb-10">
      <Design config={sec.config} view="desktop" />
    </div>
  );
}

export default function CustomDesignPage() {
  const { isLogged, isCheckingAuth } = useAuth();
  const params = useParams();
  const id = useMemo(() => (params?.id ? decodeURIComponent(String(params.id)).trim() : null), [params?.id]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [assets, setAssets] = useState<any | null>(null);

  const route = useRouter();

  useEffect(() => {
    // Wait until the auth check finishes to avoid triggering API calls that
    // may return a transient 401 while auth is still being determined.
    if (isCheckingAuth) return;

    let mounted = true;
    async function run() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        // Try as slug first, then fallback to id
        let data = await getPortfolioBySlug(id);
        if (!data) {
          data = await getCustomDesignById(id);
        }
        if (!mounted) return;
        if (!data) throw new Error("Design not found");
        const raw = data.sections;
        let arr: any[] = [];
        try {
          const tmp = typeof raw === "string" ? JSON.parse(raw) : raw;
          arr = Array.isArray(tmp) ? tmp : [];
        } catch {
          arr = [];
        }
        const normalized: SectionItem[] = arr
          .map((item: any, index: number) => {
            if (!item || typeof item !== "object") return null;
            const type = typeof item.type === "string" ? item.type : undefined;
            if (!type) return null;
            const def = sectionsRegistry[type as keyof typeof sectionsRegistry];
            const config = item.config && typeof item.config === "object" ? item.config : def?.defaultConfig || {};
            return { id: item.id || `idx-${index}`, type, config } as SectionItem;
          })
          .filter(Boolean) as SectionItem[];
        setSections(normalized);
        if (data.assets) {
          setAssets(data.assets);
          applyAssetsToDom(data.assets);
        } else {
          setAssets(null);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load";
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [id, isCheckingAuth]);

  if (!id) return <div className="p-6">No design id provided.</div>;
  if (loading)
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-1 bg-black/50">
        <Spinner className="mx-auto text-white size-6" />
        <span className="text-white">Loading...</span>
      </div>
    );
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-dvh">
      <PortfolioTheme assets={assets}>
        <div className="relative flex flex-col  overflow-hidden w-full min-h-dvh">
          {!sections.length && (
            <div className="flex-1 flex items-center justify-center p-6 text-sm text-description text-center">
              No sections found for this design.
            </div>
          )}
          {!!sections.length && (
            <div>
              {sections.map((sec, idx) => (
                <SectionRenderer key={sec.id || idx} sec={sec} idx={idx} />
              ))}
            </div>
          )}
        </div>
      </PortfolioTheme>
      <div className="fixed bottom-5 left-5 z-50 flex flex-col items-start gap-1">
        <Tooltip>
          <TooltipTrigger>
            <Button asChild variant="bobble" aria-label="Edit design">
              <span
                onClick={() => {
                  route.push("/studio?mode=edit");
                }}
              >
                <Edit className="w-4 h-4" />
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={3}>
            Studio Edit
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <Button asChild variant="bobble" aria-label="Open dashboard sections">
              <span
                onClick={() => {
                  route.push("/dashboard/sections");
                }}
              >
                <CircleUser className="w-4 h-4" />
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={3}>
            Back To Dashboard
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
