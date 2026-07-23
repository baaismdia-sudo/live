import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Send, Pin, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRealtimeMatch } from "../../features/live/hooks/useRealtimeMatch";
import { useMatchPresence } from "../../features/live/hooks/useMatchPresence";
import { useAuth } from "../../contexts/AuthContext";
import { Scoreboard } from "../../features/live/components/Scoreboard";
import { CommentaryFeed } from "../../features/live/components/CommentaryFeed";
import { PageLoader } from "../../components/ui/LoadingSpinner";

interface TeamInfo { id: string; name: string; logo_url: string | null }

const TEMPLATES = [
  "Kickoff! The match is underway.",
  "What a save by the goalkeeper!",
  "Half-time whistle blows.",
  "Substitution being made.",
  "Full time! What a match.",
];

export default function CommentatorMatchPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { match, liveScore, commentary, isLoading } = useRealtimeMatch(id);
  const { presentUsers } = useMatchPresence(id, "commentator");

  const [homeTeam, setHomeTeam] = useState<TeamInfo | null>(null);
  const [awayTeam, setAwayTeam] = useState<TeamInfo | null>(null);
  const [message, setMessage] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isHighlight, setIsHighlight] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!match) return;
    if (match.home_team_id) supabase.from("teams").select("id, name, logo_url").eq("id", match.home_team_id).single().then(({ data }) => setHomeTeam(data));
    if (match.away_team_id) supabase.from("teams").select("id, name, logo_url").eq("id", match.away_team_id).single().then(({ data }) => setAwayTeam(data));
  }, [match]);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [commentary.length]);

  const otherCommentators = presentUsers.filter((u) => u.profileId !== profile?.id && u.role === "commentator");

  const send = async () => {
    if (!message.trim() || !profile || !match) return;
    setIsSending(true);
    try {
      await supabase.from("commentary").insert({
        match_id: match.id,
        author_id: profile.id,
        message: message.trim(),
        minute: liveScore ? Math.floor(liveScore.clock_elapsed_seconds / 60) : null,
        is_pinned: isPinned,
        is_highlight: isHighlight,
      });
      setMessage("");
      setIsPinned(false);
      setIsHighlight(false);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading || !match) return <PageLoader label="Loading commentary room..." />;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <title>Commentary · TournamentLive</title>
      <Link to="/commentator" className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]">
        <ArrowLeft size={15} /> Back to matches
      </Link>

      {otherCommentators.length > 0 && (
        <div className="rounded-lg bg-[var(--color-info)]/10 px-3 py-2 text-sm text-[var(--color-info)]">
          {otherCommentators.map((u) => u.fullName).join(", ")} also commentating live.
        </div>
      )}

      <Scoreboard match={match} liveScore={liveScore} homeTeam={homeTeam} awayTeam={awayTeam} />

      <div className="flex flex-wrap gap-1.5">
        {TEMPLATES.map((t) => (
          <button key={t} onClick={() => setMessage(t)} className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-muted)] hover:bg-[var(--color-surface-secondary)]">
            {t.length > 28 ? `${t.slice(0, 28)}...` : t}
          </button>
        ))}
      </div>

      <div className="space-y-2 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write commentary... supports **bold** and *italic*, emoji 🎉 welcome"
          rows={3}
          className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <label className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
              <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="rounded" />
              <Pin size={13} /> Pin
            </label>
            <label className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
              <input type="checkbox" checked={isHighlight} onChange={(e) => setIsHighlight(e.target.checked)} className="rounded" />
              <Sparkles size={13} /> Highlight
            </label>
          </div>
          <button
            onClick={send}
            disabled={isSending || !message.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
          >
            <Send size={14} /> Post
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <CommentaryFeed items={commentary} />
        <div ref={feedEndRef} />
      </div>
    </div>
  );
}
