import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Cloud, Users as UsersIcon } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRealtimeMatch } from "../../features/live/hooks/useRealtimeMatch";
import { Scoreboard } from "../../features/live/components/Scoreboard";
import { Timeline } from "../../features/live/components/Timeline";
import { CommentaryFeed } from "../../features/live/components/CommentaryFeed";
import { ShareBar } from "../../features/live/components/ShareBar";
import { StreamEmbed } from "../../features/live/components/StreamEmbed";
import { MatchReportButton } from "../../features/live/components/MatchReportButton";
import { getSportConfig } from "../../features/live/data/sportEventConfigs";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { Seo } from "../../components/seo/Seo";

interface TeamInfo { id: string; name: string; logo_url: string | null }
interface LineupRow { player_id: string; is_starting: boolean; position: string | null; team_id: string; players: { full_name: string } | null }
interface StreamInfo { stream_url: string; provider: string; is_active: boolean }

type Tab = "summary" | "timeline" | "commentary" | "stats" | "lineups";

export default function LiveMatchPage() {
  const { id } = useParams<{ id: string }>();
  const { match, liveScore, events, commentary, isLoading } = useRealtimeMatch(id);
  const [tab, setTab] = useState<Tab>("summary");
  const [sport, setSport] = useState("football");
  const [tournamentName, setTournamentName] = useState("");
  const [homeTeam, setHomeTeam] = useState<TeamInfo | null>(null);
  const [awayTeam, setAwayTeam] = useState<TeamInfo | null>(null);
  const [lineups, setLineups] = useState<LineupRow[]>([]);
  const [stream, setStream] = useState<StreamInfo | null>(null);
  const [venueDetail, setVenueDetail] = useState<{ name: string; city: string | null; google_maps_url: string | null } | null>(null);

  useEffect(() => {
    if (!match) return;
    supabase.from("tournaments").select("sport, name").eq("id", match.tournament_id).single().then(({ data }) => {
      setSport(data?.sport ?? "football");
      setTournamentName(data?.name ?? "");
    });
    if (match.home_team_id) supabase.from("teams").select("id, name, logo_url").eq("id", match.home_team_id).single().then(({ data }) => setHomeTeam(data));
    if (match.away_team_id) supabase.from("teams").select("id, name, logo_url").eq("id", match.away_team_id).single().then(({ data }) => setAwayTeam(data));
    supabase.from("match_lineups").select("player_id, is_starting, position, team_id, players(full_name)").eq("match_id", match.id).then(({ data }) => setLineups((data ?? []) as unknown as LineupRow[]));
    supabase.from("live_streams").select("stream_url, provider, is_active").eq("match_id", match.id).eq("is_active", true).maybeSingle().then(({ data }) => setStream(data));
  }, [match]);

  useEffect(() => {
    const venueId = (match as unknown as { venue_id?: string })?.venue_id;
    if (venueId) {
      supabase.from("venues").select("name, city, google_maps_url").eq("id", venueId).single().then(({ data }) => setVenueDetail(data));
    }
  }, [match]);

  if (isLoading || !match) return <PageLoader label="Loading match..." />;

  const config = getSportConfig(sport);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${homeTeam?.name ?? "Home"} vs ${awayTeam?.name ?? "Away"} — live on TournamentLive`;

  const TABS: { key: Tab; label: string }[] = [
    { key: "summary", label: "Summary" },
    { key: "timeline", label: "Timeline" },
    { key: "commentary", label: "Commentary" },
    { key: "stats", label: "Statistics" },
    { key: "lineups", label: "Lineups" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Seo title={shareText} description={`Live score for ${shareText} in ${tournamentName}`} path={`/live/${match.id}`} />

      <p className="text-center text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">{tournamentName} {match.round && `· ${match.round}`}</p>

      <Scoreboard match={match} liveScore={liveScore} homeTeam={homeTeam} awayTeam={awayTeam} />

      {stream?.is_active && <StreamEmbed streamUrl={stream.stream_url} provider={stream.provider} />}

      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-muted)]">
        {venueDetail && (
          <a href={venueDetail.google_maps_url ?? "#"} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[var(--color-primary)]">
            <MapPin size={13} /> {venueDetail.name}{venueDetail.city && `, ${venueDetail.city}`}
          </a>
        )}
        {match.weather && <span className="flex items-center gap-1"><Cloud size={13} /> {match.weather}</span>}
        {match.attendance && <span className="flex items-center gap-1"><UsersIcon size={13} /> {match.attendance.toLocaleString()} attendance</span>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ShareBar url={shareUrl} text={shareText} qrLabel={shareText} />
        <MatchReportButton
          data={{
            match, liveScore, events,
            homeTeamName: homeTeam?.name ?? "Home", awayTeamName: awayTeam?.name ?? "Away",
            tournamentName, venueName: venueDetail?.name, attendance: match.attendance,
          }}
        />
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === "summary" && (
          <div className="space-y-3 text-sm text-[var(--color-text)]">
            <p>{homeTeam?.name} take on {awayTeam?.name} in {tournamentName}.</p>
            {events.filter((e) => !e.undone).length > 0 && (
              <div>
                <p className="mb-2 font-medium text-[var(--color-heading)]">Key moments</p>
                <Timeline events={events.slice(-5)} sport={sport} />
              </div>
            )}
          </div>
        )}
        {tab === "timeline" && <Timeline events={events} sport={sport} />}
        {tab === "commentary" && <CommentaryFeed items={commentary} />}
        {tab === "stats" && <StatsPanel sport={sport} matchId={match.id} statLabels={config.statLabels} />}
        {tab === "lineups" && <LineupsPanel lineups={lineups} homeTeamId={match.home_team_id} awayTeamId={match.away_team_id} />}
      </div>
    </div>
  );
}

// TeamInfo here is a superset of what Scoreboard's local team prop type needs
// (name/logo_url), so it's passed straight through with no adapter.

function LineupsPanel({ lineups, homeTeamId, awayTeamId }: { lineups: LineupRow[]; homeTeamId: string | null; awayTeamId: string | null }) {
  const homeLineup = lineups.filter((l) => l.team_id === homeTeamId);
  const awayLineup = lineups.filter((l) => l.team_id === awayTeamId);

  if (lineups.length === 0) {
    return <p className="py-8 text-center text-sm text-[var(--color-muted)]">Lineups haven't been published yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {[homeLineup, awayLineup].map((lineup, i) => (
        <div key={i}>
          <p className="mb-2 text-xs font-semibold uppercase text-[var(--color-muted)]">{i === 0 ? "Home" : "Away"}</p>
          <p className="mb-1 text-xs font-medium text-[var(--color-text)]">Starting XI</p>
          <ul className="space-y-1 text-sm text-[var(--color-text)]">
            {lineup.filter((l) => l.is_starting).map((l) => <li key={l.player_id}>{l.players?.full_name} {l.position && <span className="text-xs text-[var(--color-muted)]">({l.position})</span>}</li>)}
          </ul>
          {lineup.some((l) => !l.is_starting) && (
            <>
              <p className="mb-1 mt-3 text-xs font-medium text-[var(--color-text)]">Substitutes</p>
              <ul className="space-y-1 text-sm text-[var(--color-muted)]">
                {lineup.filter((l) => !l.is_starting).map((l) => <li key={l.player_id}>{l.players?.full_name}</li>)}
              </ul>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function StatsPanel({ matchId, statLabels }: { sport: string; matchId: string; statLabels: Record<string, string> }) {
  const [rows, setRows] = useState<{ stat_key: string; total: number }[]>([]);

  useEffect(() => {
    supabase
      .from("player_statistics")
      .select("stat_key, stat_value, match_events!source_event_id(undone)")
      .eq("match_id", matchId)
      .then(({ data }) => {
        const totals: Record<string, number> = {};
        ((data ?? []) as unknown as { stat_key: string; stat_value: number; match_events: { undone: boolean } | null }[]).forEach((r) => {
          if (r.match_events?.undone) return;
          totals[r.stat_key] = (totals[r.stat_key] ?? 0) + r.stat_value;
        });
        setRows(Object.entries(totals).map(([stat_key, total]) => ({ stat_key, total })));
      });
  }, [matchId]);

  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-[var(--color-muted)]">Statistics will appear as the match progresses.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {rows.map((r) => (
        <div key={r.stat_key} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center">
          <p className="text-lg font-semibold text-[var(--color-heading)]">{r.total}</p>
          <p className="text-xs text-[var(--color-muted)]">{statLabels[r.stat_key] ?? r.stat_key}</p>
        </div>
      ))}
    </div>
  );
}
