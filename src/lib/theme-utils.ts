import { COLOR_COMBINATIONS, FONT_OPTIONS } from "@/lib/theme-constants";
import type { Asset, ColorTheme, FontTheme } from "@/types/asset";

const DEFAULT_COLOR: ColorTheme = "BLUE";
const DEFAULT_FONT: FontTheme = "SANS_SERIF";

export const resolveColorPalette = (colorTheme?: ColorTheme) =>
  COLOR_COMBINATIONS.find((c) => c.name === colorTheme) ??
  COLOR_COMBINATIONS.find((c) => c.name === DEFAULT_COLOR) ??
  COLOR_COMBINATIONS[0];

export const resolveFontFamily = (fontTheme?: FontTheme) =>
  FONT_OPTIONS.find((f) => f.label === fontTheme)?.value ??
  FONT_OPTIONS.find((f) => f.label === DEFAULT_FONT)?.value ??
  FONT_OPTIONS[0]?.value ??
  "var(--font-montserrat)";

export const applyAssetsToDom = (asset?: Asset | null, target?: HTMLElement | null) => {
  if (typeof document === "undefined") return;

  const root = target ?? document.documentElement;
  if (!root) return;

  const palette = resolveColorPalette(asset?.colorTheme);
  const font = resolveFontFamily(asset?.fontTheme);

  if (palette) {
    root.style.setProperty("--color-portf-primary", palette.primary);
    root.style.setProperty("--color-portf-secondary", palette.secondary);
    root.style.setProperty("--color-portf-background", palette.secondary);
  }

  if (font) {
    root.style.setProperty("--font-portf-font", font);
    root.style.setProperty("--portf-font", font);
  }
};
