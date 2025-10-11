"use client";
import React, { useEffect, useId } from "react";

/** Shape of design assets we care about */
export interface PortfolioAssets {
  palette?: {
    name?: string;
    /** Accent / brand color */
    primary?: string; // accent
    /** Secondary / surface tint */
    secondary?: string; // surface alt
  };
  font?: string; // CSS font-family string
  mode?: "light" | "dark"; // optional explicit mode toggle
}

interface PortfolioThemeProps {
  assets?: PortfolioAssets | null;
  /** Children rendered inside the themed scope */
  children: React.ReactNode;
  /** Optional className for outer wrapper */
  className?: string;
}

/** Utility: clamp a value between 0-255 */
const clamp = (n: number) => Math.max(0, Math.min(255, n));
const hexToRgb = (hex?: string): [number, number, number] | null => {
  if (!hex) return null;
  let h = hex.trim();
  if (h.startsWith("#")) h = h.slice(1);
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return [r, g, b];
};
const luminance = (hex?: string): number => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const [r, g, b] = rgb.map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (r as number) + 0.7152 * (g as number) + 0.0722 * (b as number);
};
const lighten = (hex?: string, amount = 8): string | undefined => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb;
  return `#${clamp(r + amount)
    .toString(16)
    .padStart(2, "0")}${clamp(g + amount)
    .toString(16)
    .padStart(2, "0")}${clamp(b + amount)
    .toString(16)
    .padStart(2, "0")}`;
};
const darken = (hex?: string, amount = 8): string | undefined => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb;
  return `#${clamp(r - amount)
    .toString(16)
    .padStart(2, "0")}${clamp(g - amount)
    .toString(16)
    .padStart(2, "0")}${clamp(b - amount)
    .toString(16)
    .padStart(2, "0")}`;
};

/**
 * Compute the scoped CSS variable string for the given assets.
 * We emit a very small set of portfolio-specific variables (pt-*), then map
 * the existing design tokens used by sections inside the scope.
 */
function buildCSS(assets?: PortfolioAssets | null) {
  const accent = assets?.palette?.primary?.trim() || "#fa6b77"; // fallback existing accent
  const surfaceAlt = assets?.palette?.secondary?.trim() || lighten(accent, 70) || "#f5f5f5";
  const surface = lighten(accent, 90) || "#ffffff"; // light surface based on accent
  const background = "#ffffff"; // keep stable white background for consistency
  const mode = assets?.mode || "light";

  // Derive dark mode variant if requested
  const isDark = mode === "dark";
  const bg = isDark ? "#1f1f1f" : background;
  const surfaceColor = isDark ? darken(surface, 60) || "#121212" : surface;
  const surfaceAltColor = isDark ? darken(surfaceAlt, 55) || "#1d1d1d" : surfaceAlt;
  const accentColor = isDark ? lighten(accent, 15) || accent : accent;
  const text = isDark ? "#ffffff" : "#111111";
  const textMuted = isDark ? "#c7c7c7" : "#555555";
  const border = isDark ? darken(surfaceColor, 25) || "#2a2a2a" : lighten(surfaceColor, -10) || "#d0d0d0";
  const font = assets?.font?.trim();

  return `
  .preview-theme { 
    --pt-bg: ${bg};
    --pt-surface: ${surfaceColor};
    --pt-surface-alt: ${surfaceAltColor};
    --pt-accent: ${accentColor};
    --pt-text: ${text};
    --pt-text-muted: ${textMuted};
    --pt-border: ${border};
    ${font ? `--pt-font: ${font};` : ""}

    background: var(--pt-bg);
    color: var(--pt-text);
    font-family: var(--pt-font, var(--font-montserrat));

    /* Map legacy design tokens consumed by blocks */
    --color-title: var(--pt-text);
    --color-description: var(--pt-text-muted);
    --color-card-bg: var(--pt-surface);
    --color-card-border: var(--pt-border);
    --color-secondary-card: var(--pt-surface-alt);
    --color-accent: var(--pt-accent);
    --background: var(--pt-bg);
    --foreground: var(--pt-text);
    --card: var(--pt-surface);
    --card-foreground: var(--pt-text);
    --border: var(--pt-border);
    --input: var(--pt-border);
    --primary: var(--pt-accent);
    --primary-foreground: #ffffff;
    --accent: var(--pt-accent);
    --accent-foreground: #ffffff;
    --muted: var(--pt-surface-alt);
    --muted-foreground: var(--pt-text-muted);
    --ring: var(--pt-accent);
  }
  `;
}

export const PortfolioTheme: React.FC<PortfolioThemeProps> = ({ assets, children, className }) => {
  const styleId = useId();
  const css = buildCSS(assets);

  useEffect(() => {
    let styleEl = document.getElementById(`portfolio-theme-style-${styleId}`) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = `portfolio-theme-style-${styleId}`;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
    return () => {
      // optional cleanup (keep for reuse across route transitions) – comment out to persist
      // styleEl?.parentElement?.removeChild(styleEl);
    };
  }, [css, styleId]);

  return <div className={`preview-theme ${className || ""}`}>{children}</div>;
};

export default PortfolioTheme;
