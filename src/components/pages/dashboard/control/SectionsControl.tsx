"use client";

import React, { useEffect, useState } from "react";
import { IconButton } from "@/components/ui-tools/ui/button";
import { Blocks, Palette } from "lucide-react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useStudio } from "@/context/StudioContext";
import { resolveUserPortfolioId } from "@/lib/portfolio-helpers";

// Lazy-load heavy content pieces to keep initial control panel light
const BlockContent = dynamic(() => import("./section-control-contents/BlockContent"), { ssr: false });
const ThemeContent = dynamic(() => import("./section-control-contents/ThemeContent"), { ssr: false });

export default function SectionsControl() {
  const [active, setActive] = useState<"sections" | "assets">("sections");
  const { user } = useAuth();
  const { portfolioId, setPortfolioId, setCustomDesignId } = useStudio();

  // Resolve the current user's portfolio id from backend (unified table)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const userId = (user as any)?.userId || (user as any)?.id;
      if (!userId) return;
      if (portfolioId) return; // already resolved
      try {
        const id = await resolveUserPortfolioId(String(userId));
        if (!cancelled && id) {
          setPortfolioId(id);
          setCustomDesignId(id);
        }
      } catch {
        // ignore – controls can still work and create a new portfolio when publishing
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [user, portfolioId, setPortfolioId, setCustomDesignId]);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex gap-6">
        <aside className="w-40 hidden sm:block">
          <div className="flex flex-col gap-0.5">
            <IconButton
              variant={active === "sections" ? "grayFill" : "transparent"}
              onClick={() => setActive("sections")}
              className="w-full flex justify-start items-center gap-2"
            >
              <Blocks className="size-4" />
              <span>Blocks</span>
            </IconButton>
            <IconButton
              variant={active === "assets" ? "grayFill" : "transparent"}
              onClick={() => setActive("assets")}
              className="w-full flex justify-start items-center gap-2"
            >
              <Palette className="size-4" />
              <span>Theme</span>
            </IconButton>
          </div>
        </aside>
        <main className="flex-1 min-h-[60vh]">{active === "sections" ? <BlockContent /> : <ThemeContent />}</main>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:hidden">
        <IconButton
          variant={active === "sections" ? "grayFill" : "transparent"}
          onClick={() => setActive("sections")}
          className="w-full flex justify-center items-center gap-2"
        >
          <Blocks className="size-4" />
          <span className="text-sm">Blocks</span>
        </IconButton>
        <IconButton
          variant={active === "assets" ? "grayFill" : "transparent"}
          onClick={() => setActive("assets")}
          className="w-full flex justify-center items-center gap-2"
        >
          <Palette className="size-4" />
          <span className="text-sm">Theme</span>
        </IconButton>
      </div>
    </div>
  );
}
