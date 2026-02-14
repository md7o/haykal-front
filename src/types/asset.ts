export type ColorTheme = "RED" | "BLUE" | "GREEN" | "YELLOW" | "PURPLE" | "ORANGE" | "PINK" | "CYAN" | "GRAY" | "BLACK" | "WHITE";

export type FontTheme = "SERIF" | "SANS_SERIF" | "MONOSPACE" | "DISPLAY";

export type Asset = {
  id: string;
  portfolioId: string;
  colorTheme: ColorTheme;
  fontTheme: FontTheme;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};
