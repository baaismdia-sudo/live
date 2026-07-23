import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, WifiOff } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRealtimeMatch } from "../../features/live/hooks/useRealtimeMatch";
import { useMatchPresence } from "../../features/live/hooks/useMatchPresence";
import { useAuth } from "../../contexts/AuthContext";
import { Scoreboard } from "../../features/live/components/Scoreboard";
import { MatchClockControl } from "../../features/live/components/MatchClockControl";
import { QuickActionButtons } from "../../features/live/components/QuickActionButtons";
import { Timeline } from "../../features/live/components/Timeline";
import { getSportConfig, type QuickAction } from "../../features/live/data/sportEventConfigs";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import {
  startMatch, pauseClock, resumeClock, endMatch, addAddedTime, logMatchEvent, undoEvent, setMatchStatus,
} from "../../services/supabase/matchControl";

interface TeamInfo { id: string; name: string; logo_url: string | null }
interface PlayerOption { id: string; full_name: string }

export default function ScorekeeperMatchControlPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { match, liveScore, events, isConnected, isLoading } = useRealtimeMatch(id);
  const { presentUsers } = useMatchPresence(id, "scorekeeper");

  const [sport, setSport] = useState("football");
  const [homeTeam, setHomeTeam] = useState<TeamInfo | null>(null);
  const [awayTeam, setAwayTeam] = useState<TeamInfo | null>(null);
  const [homePlayers, setHomePlayers] = useState<PlayerOption[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<PlayerOption[]>([]);

  useEffect(() => {
    if (!match) return;
    supabase.from("tournaments").select("sport").eq("id", match.tournament_id).single().then(({ data }) => setSport(data?.sport ?? "football"));
    if (match.home_team_id) {
      supabase.from("teams").select("id, name, logo_url").eq("id", match.home_team_id).single().then(({ data }) => setHomeTeam(data));
      supabase.from("players").select("id, full_name").eq("team_id", match.home_team_id).is("deleted_at", null).then(({ data }) => setHomePlayers(data ?? []));
    }
    if (match.away_team_id) {
      supabase.from("teams").select("id, name, logo_url").eq("id", match.away_team_id).single().then(({ data }) => setAwayTeam(data));
      supabase.from("players").select("id, full_name").eq("team_id", match.away_team_id).is("deleted_at", null).then(({ data }) => setAwayPlayers(data ?? []));
    }
  }, [match]);

  if (isLoading || !match) return <PageLoader label="Loading match control room..." />;

  const config = getSportConfig(sport);
  const otherScorekeepers = presentUsers.filter((u) => u.profileId !== profile?.id && u.role === "scorekeeper");

  const handleAction = async (action: QuickAction, team: "home" | "away", playerId?: string, value?: number) => {
    await logMatchEvent({
      matchId: match.id,
      teamId: team === "home" ? match.home_team_id ?? undefined : match.away_team_id ?? undefined,
      playerId,
      eventType: action.eventType,
      minute: liveScore ? Math.floor(liveScore.clock_elapsed_seconds / 60) : undefined,
      value: value ?? 1,
      scoreDelta: action.scoreDelta,
      scoringTeam: action.scoreDelta ? team : undefined,
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <title>Match Control · TournamentLive</title>
      <Link to="/scorekeeper" className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]">
        <ArrowLeft size={15} /> Back to matches
      </Link>

      {!isConnected && (
        <div className="flex items-center gap-2 rounded-lg bg-[var(--color-warning)]/10 px-3 py-2 text-sm text-[var(--color-warning)]">
          <WifiOff size={15} /> Reconnecting — your actions are queued and will sync automatically.
        </div>
      )}
      {otherScorekeepers.length > 0 && (
        <div className="rounded-lg bg-[var(--color-info)]/10 px-3 py-2 text-sm text-[var(--color-info)]">
          {otherScorekeepers.map((u) => u.fullName).join(", ")} {otherScorekeepers.length === 1 ? "is" : "are"} also controlling this match right now.
        </div>
      )}

      <Scoreboard match={match} liveScore={liveScore} homeTeam={homeTeam} awayTeam={awayTeam} />

      <MatchClockControl
        liveScore={liveScore}
        onStart={() => startMatch(match.id)}
        onPause={(elapsed) => pauseClock(match.id, elapsed)}
        onResume={() => resumeClock(match.id)}
        onEnd={() => endMatch(match.id, liveScore?.home_score ?? match.home_score, liveScore?.away_score ?? match.away_score)}
        onAddTime={(seconds) => addAddedTime(match.id, seconds)}
      />

      <div className="flex flex-wrap gap-2">
        {config.periods.filter((p, i, arr) => arr.indexOf(p) === i).map((period) => (
          <button
            key={period}
            onClick={() => setMatchStatus(match.id, period)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize ${
              match.status === period ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "border-[var(--color-border)] text-[var(--color-muted)]"
            }`}
          >
            {period.replace("_", " ")}
          </button>
        ))}
      </div>

      <section>
        <h2 className="mb-3 font-heading text-sm font-semibold text-[var(--color-heading)]">Quick actions</h2>
        <QuickActionButtons actions={config.quickActions} homePlayers={homePlayers} awayPlayers={awayPlayers} onAction={handleAction} />
      </section>

      <section>
        <h2 className="mb-3 font-heading text-sm font-semibold text-[var(--color-heading)]">Timeline</h2>
        <Timeline events={events} sport={sport} onUndo={(eventId) => undoEvent(eventId)} />
      </section>
    </div>
  );
}
