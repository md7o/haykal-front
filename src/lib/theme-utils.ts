/**
 * Theme utility functions for managing portfolio assets (colors, fonts)
 */

export interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
}

export interface ThemeAssets {
  palette: ColorPalette;
  font: string;
}

/**
 * Predefined color combinations for portfolios
 */
export const COLOR_COMBINATIONS: ColorPalette[] = [
  { name: "Default", primary: "#7d222b", secondary: "#fff8f5" },
  { name: "Sunset", primary: "#875a1b", secondary: "#fffae5" },
  { name: "Forest", primary: "#21605c", secondary: "#e0fff8" },
  { name: "Ocean", primary: "#1e5775", secondary: "#ddeeff" },
  { name: "Night", primary: "#2c3e50", secondary: "#d0d8eb" },
  { name: "Pinky", primary: "#4b2c50", secondary: "#ffeafd" },
  { name: "Redy", primary: "#852150", secondary: "#feddff" },
  { name: "Oily", primary: "#45502c", secondary: "#edfcd9" },
  { name: "Dirty", primary: "#50422c", secondary: "#fff9ea" },
];

/**
 * Available font options
 */
export const FONT_OPTIONS = [
  { label: "Montserrat", value: '"Montserrat", sans-serif' },
  { label: "Roboto", value: '"Roboto", sans-serif' },
  { label: "Lobster", value: '"lobster", Montserrat' },
  { label: "Inconsolata", value: '"inconsolata", Montserrat' },
  { label: "Caveat", value: '"caveat", Montserrat' },
];

/**
 * Apply theme assets to the DOM (CSS variables)
 */
export function applyAssetsToDom(assets: any): void {
  if (typeof window === "undefined" || !assets) return;

  try {
    const root = document.documentElement.style;
    const palette = assets.palette || {};
    const font = assets.font;

    const primary = (palette.primary || "").trim();
    const secondary = (palette.secondary || "").trim();

    if (primary) {
      root.setProperty("--portfolio-accent-cus", primary);
    }

    if (secondary) {
      root.setProperty("--portfolio-card-bg-cus", secondary);
      root.setProperty("--portfolio-secondary-card-cus", secondary);
    }

    if (font) {
      document.documentElement.style.setProperty("--font-montserrat-cus", font);
      document.body.style.setProperty("--font-montserrat-cus", font);
    }
  } catch {
    // Silently fail
  }
}

/**
 * Get currently applied theme from DOM
 */
export function getAppliedTheme(): { paletteIndex: number; font: string } {
  if (typeof window === "undefined") {
    return { paletteIndex: 0, font: '"Montserrat", sans-serif' };
  }

  const bodyStyles = getComputedStyle(document.body);
  const rootStyles = getComputedStyle(document.documentElement);

  const fontVar = (
    bodyStyles.getPropertyValue("--font-montserrat-cus") ||
    bodyStyles.getPropertyValue("--font-montserrat") ||
    rootStyles.getPropertyValue("--font-montserrat-cus") ||
    rootStyles.getPropertyValue("--font-montserrat")
  ).trim();
  const font = fontVar || '"Montserrat", sans-serif';

  const appliedPrimary = (
    rootStyles.getPropertyValue("--portfolio-accent-cus") ||
    rootStyles.getPropertyValue("--color-accent-cus") ||
    rootStyles.getPropertyValue("--color-accent") ||
    ""
  ).trim();

  const appliedSecondary = (
    rootStyles.getPropertyValue("--portfolio-card-bg-cus") ||
    rootStyles.getPropertyValue("--color-card-bg-cus") ||
    rootStyles.getPropertyValue("--color-card-bg") ||
    ""
  ).trim();

  const paletteIndex = COLOR_COMBINATIONS.findIndex((c) => c.primary === appliedPrimary && c.secondary === appliedSecondary);

  return {
    paletteIndex: paletteIndex >= 0 ? paletteIndex : 0,
    font,
  };
}

/**
 * Parse theme assets from context
 */
export function parseThemeAssets(assets: any): { paletteIndex: number; font: string } {
  try {
    const palette = assets?.palette || {};
    const font = assets?.font;
    const primary = (palette.primary || "").trim();
    const secondary = (palette.secondary || "").trim();

    const idx = COLOR_COMBINATIONS.findIndex((c) => c.primary === primary && c.secondary === secondary);

    return {
      paletteIndex: idx >= 0 ? idx : 0,
      font: font || '"Montserrat", sans-serif',
    };
  } catch {
    return { paletteIndex: 0, font: '"Montserrat", sans-serif' };
  }
}
