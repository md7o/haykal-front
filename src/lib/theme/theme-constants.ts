export interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
}

export const COLOR_COMBINATIONS: ColorPalette[] = [
  { name: "BLUE", primary: "#fa886b", secondary: "#fff3f0" },
  { name: "RED", primary: "#875a1b", secondary: "#fffae5" },
  { name: "GREEN", primary: "#21605c", secondary: "#f7fffe" },
  { name: "YELLOW", primary: "#1e5775", secondary: "#edf9ff" },
  { name: "PURPLE", primary: "#2c3e50", secondary: "#d0d8eb" },
  { name: "ORANGE", primary: "#4b2c50", secondary: "#fef5ff" },
  { name: "PINK", primary: "#852150", secondary: "#fffafc" },
  { name: "CYAN", primary: "#45502c", secondary: "#fcfff5" },
  { name: "BLACK", primary: "#50422c", secondary: "#fff9ea" },
  { name: "GRAY", primary: "#4b4b4b", secondary: "#f2f2f2" },
  { name: "WHITE", primary: "#0a0a0a", secondary: "#f7f7f7" },
];

export const FONT_OPTIONS = [
  { label: "CAVEAT", value: "Caveat, cursive" },
  { label: "CAIRO", value: "Cairo" },
  { label: "INCONSOLATA", value: "Inconsolata, monospace" },
  { label: "LEMONADA", value: "Lemonada, cursive" },
  { label: "RUBIK", value: "Rubik, display" },
];
