import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { ErrorState } from "../../components/ui/ErrorState";
import { QrCodeButton } from "../../features/shared/components/QrCodeButton";

interface PlayerProfile {
  id: string;
  full_name: string;
  nickname: string | null;
  photo_url: string | null;
  jersey_number: number | null;
  position: string | null;
  role: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  city: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  is_captain: boolean;
  is_vice_captain: boolean;
  awards: string[];
  teams: { name: string; tournament_id: string } | null;
}

interface StatRow {
  stat_key: string;
  stat_value: number;
  match_events: { undone: boolean } | null;
}

function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const diff = Date.now() - birth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function PlayerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [stats, setStats] = useState<StatRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("players").select("*, teams(name, tournament_id)").eq("id", id).single(),
      supabase
        .from("player_statistics")
        .select("stat_key, stat_value, match_events!source_event_id(undone)")
        .eq("player_id", id),
    ]).then(([playerRes, statsRes]) => {
      if (playerRes.error) setError(playerRes.error.message);
      else setPlayer(playerRes.data as unknown as PlayerProfile);
      setStats((statsRes.data ?? []) as StatRow[]);
      setIsLoading(false);
    });
  }, [id]);

  if (isLoading) return <PageLoader label="Loading player profile..." />;
  if (error || !player) return <div className="p-6"><ErrorState message={error ?? "Player not found"} /></div>;

  const age = calculateAge(player.date_of_birth);

  const aggregatedStats = stats.reduce<Record<string, number>>((acc, s) => {
    if (s.match_events?.undone) return acc;
    acc[s.stat_key] = (acc[s.stat_key] ?? 0) + s.stat_value;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <title>{`${player.full_name} · TournamentLive`}</title>
      <Link to="/dashboard/players" className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]">
        <ArrowLeft size={15} /> Back to players
      </Link>

      <div className="flex flex-wrap items-center gap-5 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-secondary)]">
          {player.photo_url ? <img src={player.photo_url} alt="" className="h-full w-full object-cover" /> : <User size={32} className="text-[var(--color-muted)]" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl font-bold text-[var(--color-heading)]">{player.full_name}</h1>
            {player.is_captain && <span className="rounded bg-[var(--color-accent)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--color-accent)]">Captain</span>}
            {player.is_vice_captain && <span className="rounded bg-[var(--color-secondary)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--color-secondary)]">Vice Captain</span>}
          </div>
          {player.nickname && <p className="text-sm text-[var(--color-muted)]">"{player.nickname}"</p>}
          <p className="mt-1 text-sm text-[var(--color-text)]">
            {player.teams?.name} {player.jersey_number && `· #${player.jersey_number}`} {player.position && `· ${player.position}`}
          </p>
        </div>
        <QrCodeButton value={`https://tournamentlive.app/players/${player.id}`} label={player.full_name} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoCard label="Age" value={age ? `${age}` : "—"} />
        <InfoCard label="Nationality" value={player.nationality ?? "—"} />
        <InfoCard label="Height" value={player.height_cm ? `${player.height_cm} cm` : "—"} />
        <InfoCard label="Weight" value={player.weight_kg ? `${player.weight_kg} kg` : "—"} />
      </div>

      <section className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-heading text-sm font-semibold text-[var(--color-heading)]">Career statistics</h2>
        {Object.keys(aggregatedStats).length === 0 ? (
          <p className="mt-2 text-sm text-[var(--color-muted)]">No statistics recorded yet — these populate as matches are played and events are logged.</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(aggregatedStats).map(([key, value]) => (
              <div key={key} className="rounded-lg bg-[var(--color-surface-secondary)] p-3 text-center">
                <p className="text-lg font-semibold text-[var(--color-heading)]">{value}</p>
                <p className="text-xs capitalize text-[var(--color-muted)]">{key.replace("_", " ")}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-heading text-sm font-semibold text-[var(--color-heading)]">Awards</h2>
        {player.awards.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--color-muted)]">No awards yet.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {player.awards.map((award) => (
              <li key={award} className="rounded-full bg-[var(--color-warning)]/10 px-3 py-1 text-xs font-medium text-[var(--color-warning)]">🏅 {award}</li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-[var(--color-muted)]">
        Performance charts and multi-season team history need historical data across seasons, which this
        player only starts accumulating from here — the sections above are real and will populate over time
        rather than showing placeholder charts with no data behind them.
      </p>
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
