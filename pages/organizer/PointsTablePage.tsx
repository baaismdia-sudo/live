import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { TournamentSelector } from "../../features/organizer/components/TournamentSelector";
import { useOrganizerTournaments } from "../../features/organizer/hooks/useOrganizerTournaments";
import { PageLoader, ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { ExportMenu } from "../../features/shared/components/ExportMenu";
import { BarChart2 } from "lucide-react";

interface StandingRow {
  id: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  rank: number | null;
  teams: { name: string } | null;
}

export default function PointsTablePage() {
  const { tournaments, selectedId, setSelectedId, isLoading: tournamentsLoading } = useOrganizerTournaments();
  const [rows, setRows] = useState<StandingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const load = async () => {
    if (!selectedId) return;
    setIsLoading(true);
    const { data } = await supabase.from("standings").select("*, teams(name)").eq("tournament_id", selectedId).order("rank", { ascending: true, nullsFirst: false });
    setRows((data ?? []) as unknown as StandingRow[]);
    setIsLoading(false);
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const recalculate = async () => {
    setIsRecalculating(true);
    await supabase.rpc("recalculate_standings", { p_tournament_id: selectedId });
    await load();
    setIsRecalculating(false);
  };

  if (tournamentsLoading) return null;
  if (tournaments.length === 0) return <EmptyState icon={BarChart2} title="Create a tournament first" />;

  return (
    <div className="space-y-5 p-6">
      <title>Points Table · TournamentLive</title>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--color-heading)]">Points Table</h1>
          <p className="text-sm text-[var(--color-muted)]">Recalculates automatically whenever a match is marked completed.</p>
        </div>
        <div className="flex items-center gap-2">
          <TournamentSelector tournaments={tournaments} selectedId={selectedId} onChange={setSelectedId} />
          <button onClick={recalculate} disabled={isRecalculating} className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium hover:bg-[var(--color-surface-secondary)]">
            {isRecalculating ? <ButtonSpinner /> : <RefreshCw size={15} />}
            Recalculate
          </button>
          <ExportMenu
            rows={rows.map((r) => ({ team: r.teams?.name, played: r.played, won: r.won, drawn: r.drawn, lost: r.lost, gf: r.goals_for, ga: r.goals_against, gd: r.goal_difference, points: r.points }))}
            filenameBase="points-table"
            pdfTitle="Points Table"
          />
        </div>
      </div>

      {isLoading ? (
        <PageLoader label="Loading standings..." />
      ) : rows.length === 0 ? (
        <EmptyState icon={BarChart2} title="No standings yet" description="Standings populate once matches are marked completed." />
      ) : (
        <div className="overflow-hidden rounded-card border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-surface-secondary)] text-xs uppercase text-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">P</th>
                <th className="px-4 py-3">W</th>
                <th className="px-4 py-3">D</th>
                <th className="px-4 py-3">L</th>
                <th className="px-4 py-3">GF</th>
                <th className="px-4 py-3">GA</th>
                <th className="px-4 py-3">GD</th>
                <th className="px-4 py-3">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-[var(--color-heading)]">{r.rank ?? "—"}</td>
                  <td className="px-4 py-3 font-medium text-[var(--color-heading)]">{r.teams?.name ?? "—"}</td>
                  <td className="px-4 py-3">{r.played}</td>
                  <td className="px-4 py-3">{r.won}</td>
                  <td className="px-4 py-3">{r.drawn}</td>
                  <td className="px-4 py-3">{r.lost}</td>
                  <td className="px-4 py-3">{r.goals_for}</td>
                  <td className="px-4 py-3">{r.goals_against}</td>
                  <td className="px-4 py-3">{r.goal_difference}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--color-primary)]">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-[var(--color-muted)]">
        Net Run Rate (cricket-specific) needs overs/runs-conceded data the current schema doesn't capture yet —
        flagged for the sport-specific Live Score Engine in Prompt 8, not built as an approximation here.
      </p>
    </div>
  );
}
