/**
 * Dark theme colour constants — Mission Control.
 * All components import from here. The branding accent from store
 * overrides THEME.accent at runtime via inline style.
 */
export const THEME = {
  bg:          "#0f172a",  // page / app background
  sidebar:     "#1e293b",  // sidebar + card background
  sidebarHover:"#263548",  // sidebar item hover
  card:        "#1e293b",  // card / panel background
  cardHover:   "#263548",  // card hover state
  border:      "#334155",  // dividers and borders
  borderLight: "#1e293b",  // subtle separators inside cards
  accent:      "#2563eb",  // primary CTA — overridden by branding
  accentHover: "#1d4ed8",
  text:        "#f1f5f9",  // primary text
  textMuted:   "#94a3b8",  // secondary / label text
  textDim:     "#64748b",  // placeholder / very muted
  success:     "#22c55e",
  successBg:   "#052e16",
  danger:      "#ef4444",
  dangerBg:    "#2d0a0a",
  warning:     "#f59e0b",
  warningBg:   "#1c1005",
  info:        "#0ea5e9",
  infoBg:      "#0c2231",
};
