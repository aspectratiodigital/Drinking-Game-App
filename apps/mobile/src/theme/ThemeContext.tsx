import React, { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { ThemeColors, ThemeMode, themeFor } from "./colors";

type ThemePreference = "system" | ThemeMode;

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  preference: ThemePreference;
  cyclePreference: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const NEXT_PREFERENCE: Record<ThemePreference, ThemePreference> = {
  system: "light",
  light: "dark",
  dark: "system",
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>("system");

  const mode: ThemeMode = preference === "system" ? (systemScheme === "dark" ? "dark" : "light") : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: themeFor(mode),
      preference,
      cyclePreference: () => setPreference((prev) => NEXT_PREFERENCE[prev]),
    }),
    [mode, preference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
