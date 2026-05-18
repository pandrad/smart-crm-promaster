/**
 * Theme system — Mission Control.
 * THEME is a mutable object. Call applyTheme('dark'|'light') to swap all
 * colour values in place. Components that import THEME directly will pick
 * up new values on the next React render (triggered by the version counter
 * in Main.jsx via the onThemeChange callback).
 */

const DARK = {
  bg:          "#0f172a",
  sidebar:     "#1e293b",
  sidebarHover:"#263548",
  card:        "#1e293b",
  cardHover:   "#263548",
  border:      "#334155",
  borderLight: "#1e293b",
  accent:      "#2563eb",
  accentHover: "#1d4ed8",
  text:        "#f1f5f9",
  textMuted:   "#94a3b8",
  textDim:     "#64748b",
  success:     "#22c55e",
  successBg:   "#052e16",
  danger:      "#ef4444",
  dangerBg:    "#2d0a0a",
  warning:     "#f59e0b",
  warningBg:   "#1c1005",
  info:        "#0ea5e9",
  infoBg:      "#0c2231",
};

const LIGHT = {
  bg:          "#f1f5f9",
  sidebar:     "#ffffff",
  sidebarHover:"#f1f5f9",
  card:        "#ffffff",
  cardHover:   "#f8fafc",
  border:      "#e2e8f0",
  borderLight: "#f1f5f9",
  accent:      "#2563eb",
  accentHover: "#1d4ed8",
  text:        "#0f172a",
  textMuted:   "#475569",
  textDim:     "#94a3b8",
  success:     "#16a34a",
  successBg:   "#f0fdf4",
  danger:      "#dc2626",
  dangerBg:    "#fef2f2",
  warning:     "#d97706",
  warningBg:   "#fffbeb",
  info:        "#0369a1",
  infoBg:      "#e0f2fe",
};

// The live mutable object all components import
export const THEME = { ...DARK };

export function applyTheme(mode) {
  const src = mode === "light" ? LIGHT : DARK;
  Object.assign(THEME, src);
}

export function getStoredTheme() {
  return localStorage.getItem("crm_theme") || "dark";
}

export function saveTheme(mode) {
  localStorage.setItem("crm_theme", mode);
}

// Apply stored preference immediately on module load so first render is correct
applyTheme(getStoredTheme());
