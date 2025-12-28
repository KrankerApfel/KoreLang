import { useEffect } from "react";
const THEMES = {
  dark: {
    primary: '#6B8AFF',
    secondary: '#0A0A0A',
    accent: '#3B82F6',
    background: '#121212',
    surface: '#1E1E1E',
    elevated: '#2A2A2A',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    border: '#2A2A2A',
    divider: '#1E1E1E',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    hover: '#5B7BFF',
    active: '#4B6BEF',
    disabled: '#404040',
    textInfo: "A minimalistic dark theme perfect for focused work in low-light environments.",
  },
  cappuccino: {
    primary: '#CC9B7A',
    secondary: '#191918',
    accent: '#D97757',
    background: '#F4F1ED',
    surface: '#FFFFFF',
    elevated: '#FFFFFF',
    textPrimary: '#191918',
    textSecondary: '#5C5C5A',
    textTertiary: '#8E8E8C',
    border: '#E6E3DE',
    divider: '#D4CFC7',
    success: '#2D9F7C',
    warning: '#E89C3F',
    error: '#D14343',
    info: '#5B8DBE',
    hover: '#B88762',
    active: '#A67756',
    disabled: '#BFBBB5',
    textInfo: "A warm and cozy light theme inspired by a perfect cup of cappuccino.",
  },
  "tokyo-night": {
    primary: '#7AA2F7',
    secondary: '#16161E',
    accent: '#BB9AF7',
    background: '#1A1B26',
    surface: '#24283B',
    elevated: '#414868',
    textPrimary: '#A9B1D6',
    textSecondary: '#9AA5CE',
    textTertiary: '#565F89',
    border: '#292E42',
    divider: '#1F2335',
    success: '#9ECE6A',
    warning: '#E0AF68',
    error: '#F7768E',
    info: '#7AA2F7',
    hover: '#6A92E7',
    active: '#5A82D7',
    disabled: '#3B4261',
    textInfo: "Inspired by the neon lights of Tokyo's night skyline, combining deep blues with vibrant accents.",
  },
};

export const useTheme = (themeName: string, customTheme?: any) => {
  useEffect(() => {
    const theme =
      themeName === "custom" && customTheme
        ? customTheme
        : THEMES[themeName as keyof typeof THEMES] || THEMES.dark;
    const root = document.documentElement;
    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--secondary", theme.secondary);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--background", theme.background);
    root.style.setProperty("--surface", theme.surface);
    root.style.setProperty("--elevated", theme.elevated);
    root.style.setProperty("--text-primary", theme.textPrimary);
    root.style.setProperty("--text-secondary", theme.textSecondary);
    root.style.setProperty("--text-tertiary", theme.textTertiary);
    root.style.setProperty("--border", theme.border);
    root.style.setProperty("--divider", theme.divider);
    root.style.setProperty("--success", theme.success);
    root.style.setProperty("--warning", theme.warning);
    root.style.setProperty("--error", theme.error);
    root.style.setProperty("--info", theme.info);
    root.style.setProperty("--hover", theme.hover);
    root.style.setProperty("--active", theme.active);
    root.style.setProperty("--disabled", theme.disabled);
  }, [themeName, customTheme]);
};
