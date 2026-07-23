import { useEffect, useState } from "react";
import { fetchOrganizerStats, type OrganizerStats } from "../../../services/supabase/organizerDashboard";

export function useOrganizerStats() {
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchOrganizerStats()
      .then((s) => {
        if (mounted) setStats(s);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : "Could not load stats");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { stats, isLoading, error };
}
