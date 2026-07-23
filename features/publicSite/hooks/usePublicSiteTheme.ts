import { useEffect, useState, useMemo } from "react";
import type { SiteTheme } from "./useTournamentSite";

const LIGHT_BASE = { background: "#F8FAFC", surface: "#FFFFFF", surfaceSecondary: "#F1F5F9", border: "#E2E8F0", heading: "#0F172A", text: "#475569", muted: "#64748B" };
const DARK_BASE = { background: "#0B0D12", surface: "#14171F", surfaceSecondary: "#1C202B", border: "#2A2F3B", heading: "#F8FAFC", text: "#CBD5E1", muted: "#94A3B8" };

/**
 * Per-tournament theming, scoped to the public site subtree only — this is
 * intentionally separate from the SaaS platform's ThemeContext (dashboard
 * dark mode) per the branding-separation rule: a viewer toggling dark mode
 * on a tournament site has no effect on (and no relation to) the platform
 * chrome, and vice versa.
 */
export function usePublicSiteTheme(theme: SiteTheme | null) {
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (theme) setMode(theme.dark_mode_enabled ? "dark" : "light");
  }, [theme]);

  const cssVars = useMemo(() => {
    const base = mode === "dark" ? DARK_BASE : LIGHT_BASE;
    const primary = theme?.primary_color ?? "#4F46E5";
    const secondary = theme?.secondary_color ?? "#7C3AED";
    const accent = theme?.accent_color ?? "#06B6D4";
    return {
      "--color-primary": primary,
      "--color-primary-hover": primary,
      "--color-secondary": secondary,
      "--color-accent": accent,
      "--color-success": "#10B981",
      "--color-warning": "#F59E0B",
      "--color-danger": "#EF4444",
      "--color-info": "#3B82F6",
      "--color-background": base.background,
      "--color-surface": base.surface,
      "--color-surface-secondary": base.surfaceSecondary,
      "--color-border": base.border,
      "--color-heading": base.heading,
      "--color-text": base.text,
      "--color-muted": base.muted,
      "--gradient-brand": `linear-gradient(135deg, ${primary}, ${secondary})`,
      "--shadow-sm": "0 1px 2px rgba(15,23,42,0.06)",
      "--shadow-md": "0 4px 16px rgba(15,23,42,0.1)",
      "--shadow-lg": "0 12px 32px rgba(15,23,42,0.14)",
      "--color-brand": primary,
      "--color-surface-alt": base.surfaceSecondary,
      "--color-text-muted": base.muted,
      fontFamily: theme?.font_body ?? "Inter",
    } as React.CSSProperties;
  }, [theme, mode]);

  return { mode, toggleMode: () => setMode((m) => (m === "light" ? "dark" : "light")), cssVars };
}
