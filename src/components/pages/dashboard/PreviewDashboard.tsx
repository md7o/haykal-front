"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserPortfolio } from "@/context/UserPortfolioContext";
import { useAuth } from "@/context/AuthContext";
import { MonitorSmartphone, Smartphone, Eye, Type } from "lucide-react";
import { Button } from "@/components/ui-tools/ui/button";
import { Spinner } from "@/components/ui-tools/ui/spinner";
import PublishedPortfolio from "../portfolio-feature/published-portfolio/PublishedPortfolio";

export default function PreviewDashboard() {
  const { user, isCheckingAuth } = useAuth();
  const { portfolioData, isLoading, refreshPortfolioData } = useUserPortfolio();
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const router = useRouter();

  const didLoadRef = useRef(false);
  useEffect(() => {
    if (didLoadRef.current) return;
    if (isCheckingAuth) return;
    if (!user) return;
    didLoadRef.current = true;
    refreshPortfolioData();
  }, [isCheckingAuth, user, refreshPortfolioData]);

  const handleVisitSite = () => {
    if (!portfolioData) return;
    const urlPart = portfolioData.slug || portfolioData.id;
    router.push(`/${urlPart}`);
  };

  // Extract theme info for the toolbar
  const themeInfo = (() => {
    if (!portfolioData?.assets) return null;
    try {
      const palette = (portfolioData.assets as any).palette || {};
      const font = (portfolioData.assets as any).font;
      return {
        primary: palette.primary,
        secondary: palette.secondary,
        font: font ? String(font).split(",")[0].replace(/"/g, "") : null,
      };
    } catch {
      return null;
    }
  })();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-4 py-2 bg-background">
        <div className="flex items-center gap-2">
          <Button
            variant={view === "desktop" ? "fill" : "grayFill"}
            size="small"
            onClick={() => setView("desktop")}
            className="gap-2"
          >
            <MonitorSmartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Desktop</span>
          </Button>
          <Button
            variant={view === "mobile" ? "fill" : "grayFill"}
            size="small"
            onClick={() => setView("mobile")}
            className="gap-2"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Mobile</span>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {themeInfo && (
            <div className="hidden md:flex items-center gap-4 text-sm bg-white p-3 rounded-soft">
              <div className="flex items-center gap-2">
                {themeInfo.primary && (
                  <div className="flex items-center gap-1" title={`Primary Color: ${themeInfo.primary}`}>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: themeInfo.primary }} />
                  </div>
                )}
                {themeInfo.secondary && (
                  <div className="flex items-center gap-1" title={`Secondary Color: ${themeInfo.secondary}`}>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: themeInfo.secondary }} />
                  </div>
                )}
              </div>
              {themeInfo.font && (
                <div className="flex items-center gap-1">
                  <Type size={14} /> {":"}
                  <span className="text-muted-foreground">{themeInfo.font}</span>
                </div>
              )}
            </div>
          )}

          <Button variant="grayFill" size="small" onClick={handleVisitSite} className="gap-2">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Visit Site</span>
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto rounded-soft bg-card-bg p-4">
        <div className="w-full flex items-start justify-center">
          <div
            className={`transition-all duration-300 ease-in-out ${
              view === "mobile" ? "w-[375px] h-[667px]  bg-white" : "w-full overflow-hidden bg-white"
            }`}
          >
            <PublishedPortfolio portfolio={portfolioData} view={view} showControls={false} isPreview={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
