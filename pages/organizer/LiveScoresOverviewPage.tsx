import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Radio, Eye, Gamepad2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { TournamentSelector } from "../../features/organizer/components/TournamentSelector";
import { useOrganizerTournaments } from "../../features/organizer/hooks/useOrganizerTournaments";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";

interface MatchRow {
  id: string;
  status: string;
  home_score: number;
  away_score: number;
  home: { name: string } | null;
  away: { name: string } | null;
}

export default function LiveScoresOverviewPage() {
  const { tournaments, selectedId, setSelectedId, isLoading: tournamentsLoading } = useOrganizerTournaments();
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedId) return;
    setIsLoading(true);
    supabase
      .from("matches")
      .select("id, status, home_score, away_score, home:teams!matches_home_team_id_fkey(name), away:teams!matches_away_team_id_fkey(name)")
      .eq("tournament_id", selectedId)
      .in("status", ["scheduled", "warm_up", "live", "half_time", "break", "extra_time", "penalty_shootout"])
      .then(({ data }) => {
        setMatches((data ?? []) as unknown as MatchRow[]);
        setIsLoading(false);
      });
  }, [selectedId]);

  if (tournamentsLoading) return null;
  if (tournaments.length === 0) return <EmptyState icon={Radio} title="Create a tournament first" />;

  return (
    <div className="space-y-5 p-6">
      <title>Live Scores · TournamentLive</title>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--color-heading)]">Live Scores</h1>
          <p className="text-sm text-[var(--color-muted)]">Upcoming and in-progress matches for the selected tournament.</p>
        </div>
        <TournamentSelector tournaments={tournaments} selectedId={selectedId} onChange={setSelectedId} />
      </div>

      {isLoading ? (
        <PageLoader label="Loading matches..." />
      ) : matches.length === 0 ? (
        <EmptyState icon={Radio} title="No live or upcoming matches" />
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div>
                <p className="font-medium text-[var(--color-heading)]">{m.home?.name ?? "TBD"} vs {m.away?.name ?? "TBD"}</p>
                <p className="text-xs capitalize text-[var(--color-muted)]">{m.status.replace("_", " ")} {m.status !== "scheduled" && `· ${m.home_score} - ${m.away_score}`}</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/live/${m.id}`} className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-surface-secondary)]">
                  <Eye size={13} /> View live page
                </Link>
                <Link to={`/scorekeeper/${m.id}`} className="flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-primary-hover)]">
                  <Gamepad2 size={13} /> Control match
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
