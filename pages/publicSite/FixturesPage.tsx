import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useSiteContext } from "../../features/publicSite/hooks/useSiteContext";
import { SectionHeading } from "../../features/publicSite/components/FadeInSection";
import { MatchCard } from "../../features/publicSite/components/MatchCard";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { CalendarDays } from "lucide-react";

export default function FixturesPage() {
  const { tournament } = useSiteContext();
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [teamFilter, setTeamFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("matches")
      .select("id, status, scheduled_at, venue, home_score, away_score, home_team_id, away_team_id, home:teams!matches_home_team_id_fkey(name, logo_url), away:teams!matches_away_team_id_fkey(name, logo_url)")
      .eq("tournament_id", tournament.id)
      .eq("status", "scheduled")
      .order("scheduled_at")
      .then(({ data }) => {
        setMatches(data ?? []);
        setIsLoading(false);
      });
    supabase.from("teams").select("id, name").eq("tournament_id", tournament.id).is("deleted_at", null).then(({ data }) => setTeams(data ?? []));
  }, [tournament.id]);

  const filtered = teamFilter ? matches.filter((m) => m.home_team_id === teamFilter || m.away_team_id === teamFilter) : matches;

  return (
    <div>
      <SectionHeading title="Fixtures" subtitle="Upcoming matches" />
      {teams.length > 0 && (
        <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="mb-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]">
          <option value="">All teams</option>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      )}
      {isLoading ? (
        <PageLoader label="Loading fixtures..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No upcoming fixtures" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">{filtered.map((m) => <MatchCard key={m.id} match={m} />)}</div>
      )}
    </div>
  );
}
