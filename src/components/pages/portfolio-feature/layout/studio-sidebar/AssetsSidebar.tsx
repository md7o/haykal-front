"use client";

import { useMemo } from "react";
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/shadcn_ui/sidebar";
import { usePortfolio } from "@/lib/context/PortfolioContext";
import { COLOR_COMBINATIONS, FONT_OPTIONS } from "@/lib/theme/theme-constants";
import type { ColorTheme, FontTheme } from "@/lib/types/asset";
import { Button } from "@/components/ui/shadcn_ui/button";

export default function AssetsSidebar() {
  const { portfolioId, asset, updateAssetDraft, isAssetSaving } = usePortfolio();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-bold text-description uppercase mb-3 tracking-wider">Assets</SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="mb-4 bg-card-bg p-5 rounded-soft space-y-10">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-title">Theme settings</p>
            <div className="grid gap-5">
              <p className="text-xs text-description">Color theme</p>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_COMBINATIONS.map((c) => {
                  const name = c.name as ColorTheme;
                  const isSelected = name === (asset?.colorTheme ?? "BLUE");
                  const bg = `linear-gradient(90deg, ${c.primary} 0%, ${c.primary} 50%, ${c.secondary} 50%, ${c.secondary} 100%)`;
                  return (
                    <button
                      key={name}
                      aria-pressed={isSelected}
                      title={name}
                      onClick={() => updateAssetDraft({ colorTheme: name })}
                      disabled={!portfolioId || isAssetSaving}
                      className={`w-15 h-15 cursor-pointer rounded-full focus:outline-none transition-transform hover:scale-105 flex items-center justify-center ${
                        isSelected ? "ring-2 ring-accent" : ""
                      }`}
                      style={{ background: bg }}
                    />
                  );
                })}
              </div>

              <div className="space-y-3">
                <p className="text-xs text-description">Font theme</p>
                <div className="grid gap-2">
                  {FONT_OPTIONS.map((f) => {
                    const name = f.label as FontTheme;
                    const isSelected = (asset?.fontTheme ?? "SANS_SERIF") === name;
                    return (
                      <Button
                        key={name}
                        variant={"grayFill"}
                        onClick={() => updateAssetDraft({ fontTheme: name })}
                        disabled={!portfolioId || isAssetSaving}
                        className={` hover:scale-[1.01] ${isSelected ? "ring-2 ring-accent" : ""}`}
                      >
                        <span className="text-xs text-description">{name}</span>
                        <span className="text-sm text-title" style={{ fontFamily: f.value }}>
                          Welcome to Haykal
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
