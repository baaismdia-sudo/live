import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useSiteContext } from "../../features/publicSite/hooks/useSiteContext";
import { SectionHeading } from "../../features/publicSite/components/FadeInSection";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { getSportConfig } from "../../features/live/data/sportEventConfigs";

interface LeaderRow { player_id: string; full_name: string; total: number }

const LEADERBOARDS_BY_SPORT: Record<string, { statKey: string; label: string }[]> = {
  football: [{ statKey: "goals", label: "Top Scorers" }, { statKey: "assists", label: "Top Assists" }],
  cricket: [{ statKey: "runs", label: "Highest Run Scorers" }, { statKey: "wickets_taken", label: "Best Bowlers" }],
  volleyball: [{ statKey: "points", label: "Top Point Scorers" }],
  kabaddi: [{ statKey: "raid_points", label: "Most Raid Points" }],
  badminton: [{ statKey: "smash_winners", label: "Most Smash Winners" }],
  esports: [{ statKey: "kills", label: "Most Kills" }],
};

export default function StatisticsPage() {
  const { tournament } = useSiteContext();
  const [boards, setBoards] = useState<{ label: string; rows: LeaderRow[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const boardConfigs = LEADERBOARDS_BY_SPORT[getSportConfig(tournament.sport).key] ?? LEADERBOARDS_BY_SPORT.football;

    Promise.all(
      boardConfigs.map(async (cfg) => {
        const { data } = await supabase
          .from("player_statistics")
          .select("stat_value, players!inner(id, full_name, teams!inner(tournament_id)), match_events!source_event_id(undone)")
          .eq("stat_key", cfg.statKey)
          .eq("players.teams.tournament_id", tournament.id);

        const totals = new Map<string, LeaderRow>();
        ((data ?? []) as unknown as { stat_value: number; players: { id: string; full_name: string }; match_events: { undone: boolean } | null }[]).forEach((row) => {
          if (row.match_events?.undone) return;
          const existing = totals.get(row.players.id);
          totals.set(row.players.id, { player_id: row.players.id, full_name: row.players.full_name, total: (existing?.total ?? 0) + row.stat_value });
        });

        return { label: cfg.label, rows: [...totals.values()].sort((a, b) => b.total - a.total).slice(0, 10) };
      })
    ).then((results) => {
      setBoards(results);
      setIsLoading(false);
    });
  }, [tournament.id, tournament.sport]);

  if (isLoading) return <PageLoader label="Loading statistics..." />;

  return (
    <div className="space-y-8">
      <SectionHeading title="Statistics" subtitle="Tournament leaderboards" />
      <div className="grid gap-6 sm:grid-cols-2">
        {boards.map((board) => (
          <div key={board.label} className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="mb-3 font-heading text-sm font-semibold text-[var(--color-heading)]">{board.label}</p>
            {board.rows.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">No data yet.</p>
            ) : (
              <ol className="space-y-2">
                {board.rows.map((r, i) => (
                  <li key={r.player_id} className="flex items-center justify-between text-sm">
                    <Link to={`/tournament/${tournament.slug}/players/${r.player_id}`} className="flex items-center gap-2 text-[var(--color-text)] hover:text-[var(--color-primary)]">
                      <span className="w-4 text-xs text-[var(--color-muted)]">{i + 1}</span> {r.full_name}
                    </Link>
                    <span className="font-semibold text-[var(--color-heading)]">{r.total}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
