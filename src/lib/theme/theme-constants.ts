/**
 * Theme Constants - Color combinations and font options
 * Centralized theme configuration used throughout the application
 */

export interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
}

/**
 * Predefined color combinations for portfolios
 */
export const COLOR_COMBINATIONS: ColorPalette[] = [
  { name: "BLUE", primary: "#21605c", secondary: "#fffae5" },
  { name: "RED", primary: "#875a1b", secondary: "#fffae5" },
  { name: "GREEN", primary: "#21605c", secondary: "#e0fff8" },
  { name: "YELLOW", primary: "#1e5775", secondary: "#ddeeff" },
  { name: "PURPLE", primary: "#2c3e50", secondary: "#d0d8eb" },
  { name: "ORANGE", primary: "#4b2c50", secondary: "#ffeafd" },
  { name: "PINK", primary: "#852150", secondary: "#feddff" },
  { name: "CYAN", primary: "#45502c", secondary: "#edfcd9" },
  { name: "BLACK", primary: "#50422c", secondary: "#fff9ea" },
  { name: "GRAY", primary: "#4b4b4b", secondary: "#f2f2f2" },
  { name: "WHITE", primary: "#ffffff", secondary: "#f7f7f7" },
];

/**
 * Available font options
 * Uses actual font family names that can be applied via CSS or inline styles
 */
export const FONT_OPTIONS = [
  { label: "SERIF", value: "Caveat, cursive" },
  { label: "SANS_SERIF", value: "Montserrat, sans-serif" },
  { label: "MONOSPACE", value: "Inconsolata, monospace" },
  { label: "DISPLAY", value: "Lobster, display" },
];
