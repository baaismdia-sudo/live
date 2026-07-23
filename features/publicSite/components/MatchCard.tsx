import { Link } from "react-router-dom";
import { Radio } from "lucide-react";

interface MatchCardTeam { name: string; logo_url: string | null }
interface Match {
  id: string; status: string; scheduled_at: string | null; home_score: number; away_score: number;
  home: MatchCardTeam | null; away: MatchCardTeam | null;
}

export function MatchCard({ match }: { match: Match }) {
  const isLive = ["live", "half_time", "extra_time", "penalty_shootout", "warm_up"].includes(match.status);
  return (
    <Link to={`/live/${match.id}`} className="block rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-shadow hover:shadow-[var(--shadow-md)]">
      <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
        {isLive ? (
          <span className="flex items-center gap-1 font-semibold text-[var(--color-danger)]"><Radio size={11} /> LIVE</span>
        ) : (
          <span className="capitalize">{match.status.replace("_", " ")}</span>
        )}
        {match.scheduled_at && <span>{new Date(match.scheduled_at).toLocaleString()}</span>}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <TeamRow team={match.home} />
        <span className="font-mono text-sm font-semibold text-[var(--color-heading)]">
          {match.status === "scheduled" ? "vs" : `${match.home_score} - ${match.away_score}`}
        </span>
        <TeamRow team={match.away} align="right" />
      </div>
    </Link>
  );
}

function TeamRow({ team, align = "left" }: { team: MatchCardTeam | null; align?: "left" | "right" }) {
  return (
    <div className={`flex flex-1 items-center gap-2 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded bg-[var(--color-surface-secondary)] text-xs">
        {team?.logo_url ? <img src={team.logo_url} alt="" className="h-full w-full object-cover" loading="lazy" /> : "🏳️"}
      </div>
      <span className="truncate text-sm text-[var(--color-text)]">{team?.name ?? "TBD"}</span>
    </div>
  );
}
