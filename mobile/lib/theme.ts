export const colors = {
  background: "#0f172a",
  card: "#020617",
  cardForeground: "#e2e8f0",
  foreground: "#f8fafc",
  primary: "#0369a1",
  primaryForeground: "#f8fafc",
  accent: "#0ea5e9",
  destructive: "#ef4444",
  border: "#1e293b",
  muted: "#94a3b8",
  mutedForeground: "#64748b",
  secondary: "#1e293b",
  online: "#22c55e",
  offline: "#ef4444",
  warning: "#eab308",
} as const;

export const riskColors: Record<string, string> = {
  low: "#64748b",
  medium: "#0ea5e9",
  high: "#f97316",
  critical: "#ef4444",
};

export const statusColors: Record<string, string> = {
  open: "#0ea5e9",
  acknowledged: "#eab308",
  resolved: "#22c55e",
  dismissed: "#64748b",
  record_only: "#a855f7",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;

export const typography = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;

export const theme = { colors, riskColors, statusColors, spacing, radius, typography };

export type Theme = typeof theme;
