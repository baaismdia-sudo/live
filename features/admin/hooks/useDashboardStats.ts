import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export interface DashboardStats {
  total_users: number;
  total_organizers: number;
  active_tournaments: number;
  live_matches: number;
  revenue_today: number;
  revenue_this_month: number;
  revenue_this_year: number;
  active_rentals: number;
  expired_rentals: number;
  new_users_7d: number;
  new_payments_7d: number;
  open_support_tickets: number;
  pending_contact_messages: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueSeries, setRevenueSeries] = useState<{ day: string; revenue: number }[]>([]);
  const [userGrowth, setUserGrowth] = useState<{ day: string; users: number }[]>([]);
  const [popularSports, setPopularSports] = useState<{ sport: string; tournament_count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [statsRes, revenueRes, growthRes, sportsRes] = await Promise.all([
          supabase.rpc("admin_dashboard_stats"),
          supabase.rpc("admin_revenue_series", { p_days: 30 }),
          supabase.rpc("admin_user_growth_series", { p_days: 14 }),
          supabase.rpc("admin_popular_sports"),
        ]);
        if (!mounted) return;
        if (statsRes.error) throw statsRes.error;
        setStats(statsRes.data as DashboardStats);
        setRevenueSeries(
          ((revenueRes.data ?? []) as { day: string; revenue_cents: number }[]).map((r) => ({
            day: new Date(r.day).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
            revenue: r.revenue_cents / 100,
          }))
        );
        setUserGrowth(
          ((growthRes.data ?? []) as { day: string; new_users: number }[]).map((r) => ({
            day: new Date(r.day).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
            users: r.new_users,
          }))
        );
        setPopularSports((sportsRes.data ?? []) as { sport: string; tournament_count: number }[]);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Could not load dashboard data");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { stats, revenueSeries, userGrowth, popularSports, isLoading, error };
}
