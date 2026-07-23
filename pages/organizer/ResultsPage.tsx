import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ListChecks } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { TournamentSelector } from "../../features/organizer/components/TournamentSelector";
import { useOrganizerTournaments } from "../../features/organizer/hooks/useOrganizerTournaments";
import { AdminDataTable, type Column } from "../../features/admin/components/AdminDataTable";
import { EmptyState } from "../../features/admin/components/EmptyState";

interface MatchRow {
  id: string;
  home_score: number;
  away_score: number;
  ended_at: string | null;
  home: { name: string } | null;
  away: { name: string } | null;
}

export default function ResultsPage() {
  const { tournaments, selectedId, setSelectedId, isLoading: tournamentsLoading } = useOrganizerTournaments();
  const [rows, setRows] = useState<MatchRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedId) return;
    setIsLoading(true);
    supabase
      .from("matches")
      .select("id, home_score, away_score, ended_at, home:teams!matches_home_team_id_fkey(name), away:teams!matches_away_team_id_fkey(name)")
      .eq("tournament_id", selectedId)
      .eq("status", "completed")
      .order("ended_at", { ascending: false })
      .then(({ data }) => {
        setRows((data ?? []) as unknown as MatchRow[]);
        setIsLoading(false);
      });
  }, [selectedId]);

  const columns: Column<MatchRow>[] = [
    { header: "Match", render: (m) => <Link to={`/live/${m.id}`} className="font-medium text-[var(--color-heading)] hover:text-[var(--color-primary)]">{m.home?.name} vs {m.away?.name}</Link> },
    { header: "Score", render: (m) => `${m.home_score} - ${m.away_score}` },
    { header: "Completed", render: (m) => (m.ended_at ? new Date(m.ended_at).toLocaleString() : "—") },
  ];

  if (tournamentsLoading) return null;
  if (tournaments.length === 0) return <EmptyState icon={ListChecks} title="Create a tournament first" />;

  return (
    <>
      <title>Results · TournamentLive</title>
      <div className="px-6 pt-6"><TournamentSelector tournaments={tournaments} selectedId={selectedId} onChange={setSelectedId} /></div>
      <AdminDataTable title="Results" description="Completed matches for the selected tournament." columns={columns} rows={rows} isLoading={isLoading} error={null} search="" onSearchChange={() => {}} page={1} totalPages={1} onPageChange={() => {}} emptyLabel="No completed matches yet" />
    </>
  );
}
