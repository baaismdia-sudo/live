import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { User } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { ErrorState } from "../../components/ui/ErrorState";

interface PlayerProfile {
  id: string; full_name: string; nickname: string | null; photo_url: string | null; jersey_number: number | null;
  position: string | null; role: string | null; date_of_birth: string | null; nationality: string | null;
  city: string | null; height_cm: number | null; weight_kg: number | null; is_captain: boolean; is_vice_captain: boolean;
  awards: string[]; teams: { name: string } | null;
}

function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

export default function PublicPlayerProfilePage() {
  const { playerId } = useParams<{ playerId: string }>();
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!playerId) return;
    Promise.all([
      supabase.from("players").select("*, teams(name)").eq("id", playerId).single(),
      supabase.from("player_statistics").select("stat_key, stat_value, match_events!source_event_id(undone)").eq("player_id", playerId),
    ]).then(([playerRes, statsRes]) => {
      setPlayer(playerRes.data as unknown as PlayerProfile);
      const totals: Record<string, number> = {};
      ((statsRes.data ?? []) as unknown as { stat_key: string; stat_value: number; match_events: { undone: boolean } | null }[]).forEach((r) => {
        if (r.match_events?.undone) return;
        totals[r.stat_key] = (totals[r.stat_key] ?? 0) + r.stat_value;
      });
      setStats(totals);
      setIsLoading(false);
    });
  }, [playerId]);

  if (isLoading) return <PageLoader label="Loading player..." />;
  if (!player) return <ErrorState message="Player not found" />;

  const age = calculateAge(player.date_of_birth);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-5 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-secondary)]">
          {player.photo_url ? <img src={player.photo_url} alt="" className="h-full w-full object-cover" /> : <User size={32} className="text-[var(--color-muted)]" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl font-bold text-[var(--color-heading)]">{player.full_name}</h1>
            {player.is_captain && <span className="rounded bg-[var(--color-accent)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--color-accent)]">Captain</span>}
          </div>
          {player.nickname && <p className="text-sm text-[var(--color-muted)]">"{player.nickname}"</p>}
          <p className="mt-1 text-sm text-[var(--color-text)]">{player.teams?.name} {player.jersey_number && `· #${player.jersey_number}`} {player.position && `· ${player.position}`}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoCard label="Age" value={age ? `${age}` : "—"} />
        <InfoCard label="Nationality" value={player.nationality ?? "—"} />
        <InfoCard label="Height" value={player.height_cm ? `${player.height_cm} cm` : "—"} />
        <InfoCard label="Weight" value={player.weight_kg ? `${player.weight_kg} kg` : "—"} />
      </div>

      <section className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-heading text-sm font-semibold text-[var(--color-heading)]">Tournament statistics</h2>
        {Object.keys(stats).length === 0 ? (
          <p className="mt-2 text-sm text-[var(--color-muted)]">No statistics yet.</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="rounded-lg bg-[var(--color-surface-secondary)] p-3 text-center">
                <p className="text-lg font-semibold text-[var(--color-heading)]">{value}</p>
                <p className="text-xs capitalize text-[var(--color-muted)]">{key.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {player.awards.length > 0 && (
        <section className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="font-heading text-sm font-semibold text-[var(--color-heading)]">Awards</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {player.awards.map((a) => <li key={a} className="rounded-full bg-[var(--color-warning)]/10 px-3 py-1 text-xs font-medium text-[var(--color-warning)]">🏅 {a}</li>)}
          </ul>
        </section>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
      <p className="text-lg font-semibold text-[var(--color-heading)]">{value}</p>
      <p className="text-xs text-[var(--color-muted)]">{label}</p>
    </div>
  );
}
