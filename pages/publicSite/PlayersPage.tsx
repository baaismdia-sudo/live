import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useSiteContext } from "../../features/publicSite/hooks/useSiteContext";
import { SectionHeading } from "../../features/publicSite/components/FadeInSection";
import { PlayerCard } from "../../features/publicSite/components/PlayerCard";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { User } from "lucide-react";

export default function PlayersPage() {
  const { tournament } = useSiteContext();
  const [players, setPlayers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("players")
      .select("id, full_name, photo_url, jersey_number, position, nationality, teams!inner(tournament_id)")
      .eq("teams.tournament_id", tournament.id)
      .is("deleted_at", null)
      .order("full_name")
      .then(({ data }) => {
        setPlayers(data ?? []);
        setIsLoading(false);
      });
  }, [tournament.id]);

  const filtered = search ? players.filter((p) => p.full_name.toLowerCase().includes(search.toLowerCase())) : players;

  return (
    <div>
      <SectionHeading title="Players" subtitle={`${players.length} players`} />
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search players..."
        className="mb-5 w-full max-w-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
      />
      {isLoading ? <PageLoader label="Loading players..." /> : filtered.length === 0 ? <EmptyState icon={User} title="No players found" /> : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{filtered.map((p, i) => <PlayerCard key={p.id} player={p} slug={tournament.slug} index={i} />)}</div>
      )}
    </div>
  );
}
