import { useOutletContext } from "react-router-dom";
import type { SiteTournament, SiteTheme, SiteSettingsRow, SeoSettingsRow } from "./useTournamentSite";

export interface SiteOutletContext {
  tournament: SiteTournament;
  theme: SiteTheme | null;
  siteSettings: SiteSettingsRow | null;
  seo: SeoSettingsRow | null;
}

export function useSiteContext() {
  return useOutletContext<SiteOutletContext>();
}
