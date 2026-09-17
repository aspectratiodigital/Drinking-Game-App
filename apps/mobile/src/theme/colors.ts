export type ThemeMode = "light" | "dark";

export interface ThemeColors {
  background: string;
  text: string;
  textMuted: string;
  border: string;
  cardBackground: string;
  cardBackDecoration: string;
  suitPrimary: string; // black in light mode, white in dark mode
  suitRed: string;
  buttonBackground: string;
  buttonText: string;
  correct: string;
  wrong: string;
}

export const lightTheme: ThemeColors = {
  background: "#F5F1E8",
  text: "#111111",
  textMuted: "#5c5c5c",
  border: "#111111",
  cardBackground: "#FDFBF5",
  cardBackDecoration: "#111111",
  suitPrimary: "#111111",
  suitRed: "#C81E3A",
  buttonBackground: "#111111",
  buttonText: "#F5F1E8",
  correct: "#1a7f37",
  wrong: "#c81e3a",
};

export const darkTheme: ThemeColors = {
  background: "#111111",
  text: "#F5F1E8",
  textMuted: "#9c9c9c",
  border: "#F5F1E8",
  cardBackground: "#1c1c1c",
  cardBackDecoration: "#F5F1E8",
  suitPrimary: "#F5F1E8",
  suitRed: "#E24D63",
  buttonBackground: "#F5F1E8",
  buttonText: "#111111",
  correct: "#4ade80",
  wrong: "#f87171",
};

export function themeFor(mode: ThemeMode): ThemeColors {
  return mode === "light" ? lightTheme : darkTheme;
}
