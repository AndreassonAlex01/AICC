// theme/tokens.ts
// Same brand concept as the web app (ink-blue primary, terracotta + gold
// accents, warm paper/navy surfaces) reimplemented as plain RN color values
// plus a real elevation system — the web theme was flat by comparison.
import { useColorScheme } from "react-native";

export interface Palette {
  background: string;
  surface: string;
  surfaceMuted: string;
  foreground: string;
  mutedForeground: string;
  primary: string;
  onPrimary: string;
  accentTerracotta: string;
  accentGold: string;
  border: string;
  danger: string;
  dangerSoft: string;
  shadowColor: string;
}

export const lightPalette: Palette = {
  background: "#F6F3EA",
  surface: "#FFFFFF",
  surfaceMuted: "#EFE9DB",
  foreground: "#1C2333",
  mutedForeground: "#6E6A5F",
  primary: "#1E3A5F",
  onPrimary: "#F6F3EA",
  accentTerracotta: "#C96A43",
  accentGold: "#D9A441",
  border: "#E3DDCB",
  danger: "#C1443C",
  dangerSoft: "#F6DEDB",
  shadowColor: "#1C2333",
};

export const darkPalette: Palette = {
  background: "#11141C",
  surface: "#1B1F2B",
  surfaceMuted: "#232838",
  foreground: "#F1EEE6",
  mutedForeground: "#A7A38E",
  primary: "#7CA6DE",
  onPrimary: "#101B2C",
  accentTerracotta: "#E08A5D",
  accentGold: "#E9BE63",
  border: "rgba(255,255,255,0.10)",
  danger: "#E2685F",
  dangerSoft: "rgba(226,104,95,0.16)",
  shadowColor: "#000000",
};

// Layered elevation presets (RN shadow + Android elevation together) —
// used instead of the web theme's flat borders-only cards.
export function elevation(level: 1 | 2 | 3, palette: Palette) {
  const presets = {
    1: { shadowOpacity: 0.08, shadowRadius: 6, shadowOffsetY: 2, elevation: 2 },
    2: { shadowOpacity: 0.12, shadowRadius: 12, shadowOffsetY: 4, elevation: 5 },
    3: { shadowOpacity: 0.18, shadowRadius: 20, shadowOffsetY: 8, elevation: 9 },
  }[level];
  return {
    shadowColor: palette.shadowColor,
    shadowOffset: { width: 0, height: presets.shadowOffsetY },
    shadowOpacity: presets.shadowOpacity,
    shadowRadius: presets.shadowRadius,
    elevation: presets.elevation,
  };
}

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors = isDark ? darkPalette : lightPalette;
  return { colors, isDark };
}
