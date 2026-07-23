import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShieldHalf } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useSiteContext } from "../../features/publicSite/hooks/useSiteContext";
import { PlayerCard } from "../../features/publicSite/components/PlayerCard";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { ErrorState } from "../../components/ui/ErrorState";

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { tournament } = useSiteContext();
  const [team, setTeam] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;
    supabase.from("teams").select("*").eq("id", teamId).single().then(({ data }) => setTeam(data));
    supabase.from("players").select("id, full_name, photo_url, jersey_number, position, nationality").eq("team_id", teamId).is("deleted_at", null).order("jersey_number").then(({ data }) => {
      setPlayers(data ?? []);
      setIsLoading(false);
    });
  }, [teamId]);

  if (isLoading) return <PageLoader label="Loading team..." />;
  if (!team) return <ErrorState message="Team not found" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-5 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-surface-secondary)]">
          {team.logo_url ? <img src={team.logo_url} alt="" className="h-full w-full object-cover" /> : <ShieldHalf size={28} className="text-[var(--color-muted)]" />}
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--color-heading)]">{team.name}</h1>
          <p className="text-sm text-[var(--color-muted)]">
            {[team.coach_name && `Coach: ${team.coach_name}`, team.manager_name && `Manager: ${team.manager_name}`, team.home_ground].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
      {team.description && <p className="text-sm text-[var(--color-text)]">{team.description}</p>}
      <div>
        <h2 className="mb-3 font-heading text-lg font-semibold text-[var(--color-heading)]">Roster</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {players.map((p, i) => <PlayerCard key={p.id} player={p} slug={tournament.slug} index={i} />)}
        </div>
      </div>
    </div>
  );
}
