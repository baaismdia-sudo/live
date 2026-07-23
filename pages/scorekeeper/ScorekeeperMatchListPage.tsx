import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Radio, Swords } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { useAuth } from "../../contexts/AuthContext";

interface AssignedMatch {
  id: string;
  status: string;
  scheduled_at: string | null;
  tournaments: { name: string; sport: string } | null;
  home: { name: string } | null;
  away: { name: string } | null;
}

export default function ScorekeeperMatchListPage() {
  const { roleName } = useAuth();
  const [matches, setMatches] = useState<AssignedMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("matches")
      .select("id, status, scheduled_at, tournaments(name, sport), home:teams!matches_home_team_id_fkey(name), away:teams!matches_away_team_id_fkey(name)")
      .in("status", ["scheduled", "warm_up", "live", "half_time", "break", "extra_time", "penalty_shootout"])
      .order("scheduled_at", { ascending: true })
      .then(({ data }) => {
        setMatches((data ?? []) as unknown as AssignedMatch[]);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <PageLoader label="Loading your matches..." />;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <title>Scorekeeper · TournamentLive</title>
      <div>
        <h1 className="font-heading text-xl font-bold text-[var(--color-heading)]">
          {roleName === "scorekeeper" ? "Your matches" : "Matches you can control"}
        </h1>
        <p className="text-sm text-[var(--color-muted)]">Pick a match to open the live control room.</p>
      </div>

      {matches.length === 0 ? (
        <EmptyState icon={Swords} title="No matches to control right now" />
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <Link
              key={m.id}
              to={`/scorekeeper/${m.id}`}
              className="flex items-center justify-between gap-3 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-shadow hover:shadow-[var(--shadow-md)]"
            >
              <div>
                <p className="font-medium text-[var(--color-heading)]">{m.home?.name ?? "TBD"} vs {m.away?.name ?? "TBD"}</p>
                <p className="text-xs text-[var(--color-muted)]">{m.tournaments?.name} · {m.tournaments?.sport}</p>
              </div>
              {m.status === "live" ? (
                <span className="flex items-center gap-1 rounded-full bg-[var(--color-danger)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-danger)]">
                  <Radio size={12} /> LIVE
                </span>
              ) : (
                <span className="text-xs capitalize text-[var(--color-muted)]">{m.status.replace("_", " ")}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
