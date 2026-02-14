"use client";

import { useCallback, useMemo, useState } from "react";
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui-tools/ui/sidebar";
import {} from /* Select components removed - using custom font samples */ "@/components/ui-tools/ui/select";
import { usePortfolio } from "@/context/PortfolioContext";
import { COLOR_COMBINATIONS, FONT_OPTIONS } from "@/lib/theme-constants";
import { createAsset, updateAsset } from "@/api/portfolios-api/assets-endpoints";
import type { ColorTheme, FontTheme } from "@/types/asset";
import { Button } from "@/components/ui-tools/ui/button";

export default function AssetsSidebar() {
  const { portfolioId, asset, setAsset } = usePortfolio();
  const [isSaving, setIsSaving] = useState(false);

  const colorOptions = useMemo(() => COLOR_COMBINATIONS.map((c) => c.name), []);
  const fontOptions = useMemo(() => FONT_OPTIONS.map((f) => f.label), []);

  const colorValue = asset?.colorTheme ?? "BLUE";
  const fontValue = asset?.fontTheme ?? "SANS_SERIF";

  const saveAsset = useCallback(
    async (payload: { colorTheme?: ColorTheme; fontTheme?: FontTheme }) => {
      if (!portfolioId) return;
      setIsSaving(true);
      try {
        if (asset?.id) {
          const next = await updateAsset(asset.id, payload);
          setAsset(next);
        } else {
          const next = await createAsset(portfolioId, payload);
          setAsset(next);
        }
      } finally {
        setIsSaving(false);
      }
    },
    [portfolioId, asset?.id, setAsset],
  );

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
                      onClick={() => saveAsset({ colorTheme: name })}
                      disabled={!portfolioId || isSaving}
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
                        onClick={() => saveAsset({ fontTheme: name })}
                        disabled={!portfolioId || isSaving}
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
