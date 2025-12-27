import { useEffect } from "react";
const THEMES = {
  dark: {
    bgMain: "#121212",
    bgPanel: "#1e1e1e",
    text1: "#f1f5f9",
    text2: "#94a3b8",
    textInfo: "10px",
    accent: "#3b82f6",
  },
  light: {
    bgMain: "#f8fafc",
    bgPanel: "#ffffff",
    text1: "#0f172a",
    text2: "#475569",
    textInfo: "10px",
    accent: "#2563eb",
  },
  "tokyo-night": {
    bgMain: "#1a1b26",
    bgPanel: "#24283b",
    text1: "#a9b1d6",
    text2: "#565f89",
    textInfo: "10px",
    accent: "#7aa2f7",
  },
  "tokyo-light": {
    bgMain: "#d5d6db",
    bgPanel: "#cbccd1",
    text1: "#343b58",
    text2: "#565a6e",
    textInfo: "10px",
    accent: "#34548a",
  },
};

export const useTheme = (themeName: string, customTheme?: any) => {
  useEffect(() => {
    const theme =
      themeName === "custom" && customTheme
        ? customTheme
        : THEMES[themeName as keyof typeof THEMES] || THEMES.dark;
    const root = document.documentElement;
    root.style.setProperty("--bg-main", theme.bgMain);
    root.style.setProperty("--bg-panel", theme.bgPanel);
    root.style.setProperty("--text-1", theme.text1);
    root.style.setProperty("--text-2", theme.text2);
    root.style.setProperty("--text-info", theme.textInfo || "10px");
    root.style.setProperty("--accent", theme.accent);
  }, [themeName, customTheme]);
};
