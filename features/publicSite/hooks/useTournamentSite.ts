import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";

export interface SiteTournament {
  id: string;
  name: string;
  slug: string;
  sport: string;
  season: string | null;
  description: string | null;
  status: string;
  logo_url: string | null;
  cover_image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
}

export interface SiteTheme {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  dark_mode_enabled: boolean;
  layout_variant: string;
}

export interface SiteSettingsRow {
  site_title: string | null;
  tagline: string | null;
  favicon_url: string | null;
  show_sponsors: boolean;
  show_gallery: boolean;
  show_news: boolean;
  show_live_stream: boolean;
  footer_text: string | null;
  maintenance_mode: boolean;
  homepage_sections: { key: string; visible: boolean }[];
}

export interface SeoSettingsRow {
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
}

/**
 * Resolves the tournament + its theme/site/seo config from the :slug route
 * param. This is the single entry point every public-site page uses so the
 * slug -> tournament_id lookup (and its RLS-scoped visibility check) only
 * happens once per navigation.
 */
export function useTournamentSite() {
  const { slug } = useParams<{ slug: string }>();
  const [tournament, setTournament] = useState<SiteTournament | null>(null);
  const [theme, setTheme] = useState<SiteTheme | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsRow | null>(null);
  const [seo, setSeo] = useState<SeoSettingsRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let mounted = true;
    supabase
      .from("tournaments")
      .select("id, name, slug, sport, season, description, status, logo_url, cover_image_url, starts_at, ends_at")
      .eq("slug", slug)
      .maybeSingle()
      .then(async ({ data: tournamentData }) => {
        if (!mounted) return;
        if (!tournamentData) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }
        setTournament(tournamentData);

        const [themeRes, siteRes, seoRes] = await Promise.all([
          supabase.from("website_themes").select("*").eq("tournament_id", tournamentData.id).single(),
          supabase.from("site_settings").select("*").eq("tournament_id", tournamentData.id).single(),
          supabase.from("seo_settings").select("*").eq("tournament_id", tournamentData.id).single(),
        ]);
        if (!mounted) return;
        if (themeRes.data) setTheme(themeRes.data);
        if (siteRes.data) setSiteSettings(siteRes.data as unknown as SiteSettingsRow);
        if (seoRes.data) setSeo(seoRes.data);
        setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  return { tournament, theme, siteSettings, seo, isLoading, notFound };
}
