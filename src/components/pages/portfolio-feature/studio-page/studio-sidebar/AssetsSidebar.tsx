"use client";
import React, { useEffect, useState } from "react";
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui-tools/ui/sidebar";
import { useStudio } from "@/context/studio-context-logic/StudioContext";
import { updatePortfolio } from "@/api/portfolio-endpoints";
import { COLOR_COMBINATIONS, FONT_OPTIONS, applyAssetsToDom, parseThemeAssets, getAppliedTheme } from "@/lib/theme-utils";

export default function AssetsSidebar() {
  const { portfolioId, assets: ctxAssets, setAssets } = useStudio();

  const [selectedFont, setSelectedFont] = useState<string>("");
  const [selectedComboIndex, setSelectedComboIndex] = useState<number>(0);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [themeFeedback, setThemeFeedback] = useState<string | null>(null);
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (ctxAssets) {
      const { paletteIndex, font } = parseThemeAssets(ctxAssets);
      setSelectedComboIndex(paletteIndex);
      setSelectedFont(font);
    } else {
      const { paletteIndex, font } = getAppliedTheme();
      setSelectedComboIndex(paletteIndex);
      setSelectedFont(font);
    }
  }, [ctxAssets]);

  const persistAssets = async (paletteIdx: number, font: string) => {
    if (!portfolioId) {
      setThemeFeedback("Save portfolio first to persist theme");
      return;
    }
    setIsSavingTheme(true);
    setThemeFeedback(null);
    try {
      const palette = COLOR_COMBINATIONS[paletteIdx];
      const assetsPayload = { palette: { name: palette.name, primary: palette.primary, secondary: palette.secondary }, font };

      await updatePortfolio(portfolioId, { assets: assetsPayload });

      try {
        if (typeof window !== "undefined") sessionStorage.setItem("designAssetsDraft", JSON.stringify(assetsPayload));
      } catch {}

      setThemeFeedback("Theme saved");
    } catch (e) {
      setThemeFeedback(e instanceof Error ? e.message : "Failed to save theme");
    } finally {
      setIsSavingTheme(false);
      setTimeout(() => setThemeFeedback(null), 4000);
    }
  };

  const schedulePersist = (paletteIdx: number, font: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistAssets(paletteIdx, font), 500);
  };

  const applyColorCombination = (combination: { primary: string; secondary: string }, idx: number) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement.style;
    const primary = (combination.primary || "").trim();
    const secondary = (combination.secondary || "").trim();
    if (primary) root.setProperty("--portfolio-accent-cus", primary);
    else root.removeProperty("--portfolio-accent-cus");
    if (secondary) {
      root.setProperty("--portfolio-card-bg-cus", secondary);
      root.setProperty("--portfolio-secondary-card-cus", secondary);
    } else {
      root.removeProperty("--portfolio-card-bg-cus");
      root.removeProperty("--portfolio-secondary-card-cus");
    }
    [
      "--color-accent-cus",
      "--primary-cus",
      "--accent-cus",
      "--ring-cus",
      "--color-title-cus",
      "--color-card-bg-cus",
      "--color-secondary-cus",
      "--card-cus",
      "--muted-cus",
    ].forEach((v) => root.removeProperty(v));
    setSelectedComboIndex(idx);
    // update context assets immediately so preview updates without needing to open Assets panel
    try {
      const payload = {
        palette: { name: COLOR_COMBINATIONS[idx].name, primary: combination.primary, secondary: combination.secondary },
        font: selectedFont,
      };
      setAssets(payload);
    } catch {}
    schedulePersist(idx, selectedFont);
  };

  const handleFontChange = (value: string) => {
    setSelectedFont(value);
    if (typeof window === "undefined") return;
    document.documentElement.style.setProperty("--font-montserrat-cus", value);
    document.body.style.setProperty("--font-montserrat-cus", value);
    try {
      const payload = { palette: COLOR_COMBINATIONS[selectedComboIndex], font: value };
      setAssets(payload);
    } catch {}
    schedulePersist(selectedComboIndex, value);
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="font-bold text-description uppercase mb-3 tracking-wider">Colors Theme</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="mb-4 bg-card-bg  p-5 rounded-lg">
            <div className="grid grid-cols-3 gap-2">
              {COLOR_COMBINATIONS.map((combo, idx) => {
                const active = selectedComboIndex === idx;
                return (
                  <button
                    key={combo.name}
                    onClick={() => applyColorCombination(combo, idx)}
                    className={`group relative flex rounded-full overflow-hidden shadow-md transition-all duration-200 hover:scale-105 cursor-pointer ring-offset-2 ${
                      active ? "ring-2 ring-accent" : "hover:ring-1 ring-accent/40"
                    }`}
                    title={combo.name}
                  >
                    <div className="w-1/2 h-16" style={{ backgroundColor: combo.primary, opacity: 20 }} />
                    <div className="w-1/2 h-16" style={{ backgroundColor: combo.secondary, opacity: 50 }} />

                    {idx === 0 && !active && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white bg-black/30">
                        {combo.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-[10px] text-description flex items-center gap-3">
              {isSavingTheme ? <span>Saving theme...</span> : themeFeedback ? <span>{themeFeedback}</span> : <span>&nbsp;</span>}
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
      <div className="h-px my-5 w-full bg-card-border opacity-50" />
      <SidebarGroup>
        <SidebarGroupLabel className="font-bold text-description uppercase mb-3 tracking-wider">Fonts Theme</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="grid grid-cols-2 gap-2">
            {FONT_OPTIONS.map((opt) => {
              const active = selectedFont === opt.value;
              return (
                <button
                  key={opt.label}
                  onClick={() => handleFontChange(opt.value)}
                  className={`flex items-center justify-center text-xl h-12 rounded-md bg-card-bg transition-all duration-200 hover:scale-105 cursor-pointer ${
                    active ? "ring-2 ring-accent" : "ring-0"
                  }`}
                  title={opt.label}
                  style={{ fontFamily: opt.value }}
                >
                  ABC
                </button>
              );
            })}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
      {/* Mode controls removed */}
    </>
  );
}
