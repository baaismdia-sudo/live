import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useSiteContext } from "../../features/publicSite/hooks/useSiteContext";
import { SectionHeading } from "../../features/publicSite/components/FadeInSection";
import { MatchCard } from "../../features/publicSite/components/MatchCard";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { Radio } from "lucide-react";

export default function LiveIndexPage() {
  const { tournament } = useSiteContext();
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("matches")
      .select("id, status, scheduled_at, home_score, away_score, home:teams!matches_home_team_id_fkey(name, logo_url), away:teams!matches_away_team_id_fkey(name, logo_url)")
      .eq("tournament_id", tournament.id)
      .in("status", ["live", "half_time", "extra_time", "penalty_shootout", "warm_up", "scheduled"])
      .order("scheduled_at")
      .then(({ data }) => {
        setMatches(data ?? []);
        setIsLoading(false);
      });
  }, [tournament.id]);

  return (
    <div>
      <SectionHeading title="Live Scores" subtitle="Live and upcoming matches" />
      {isLoading ? <PageLoader label="Loading matches..." /> : matches.length === 0 ? <EmptyState icon={Radio} title="No live matches right now" /> : (
        <div className="grid gap-3 sm:grid-cols-2">{matches.map((m) => <MatchCard key={m.id} match={m} />)}</div>
      )}
      <p className="mt-4 text-xs text-[var(--color-muted)]">Tap a match to open its full realtime live score page.</p>
    </div>
  );
}
