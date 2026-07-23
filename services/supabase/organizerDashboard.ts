import { supabase } from "../../lib/supabaseClient";

export interface OrganizerStats {
  active_tournaments: number;
  total_tournaments: number;
  upcoming_matches: number;
  live_matches: number;
  completed_matches: number;
  total_teams: number;
  total_players: number;
  active_subscription_status: string | null;
  nearest_rental_expiry: string | null;
}

export async function fetchOrganizerStats(): Promise<OrganizerStats> {
  const { data, error } = await supabase.rpc("organizer_dashboard_stats");
  if (error) throw error;
  return data as OrganizerStats;
}
