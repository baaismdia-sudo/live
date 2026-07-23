import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";

export interface MatchRow {
  id: string;
  tournament_id: string;
  home_team_id: string | null;
  away_team_id: string | null;
  status: string;
  venue: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  home_score: number;
  away_score: number;
  round: string | null;
  weather: string | null;
  attendance: number | null;
}

export interface LiveScoreRow {
  id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  period: string | null;
  time_elapsed: string | null;
  is_live: boolean;
  sport_state: Record<string, unknown>;
  clock_status: "stopped" | "running" | "paused";
  clock_started_at: string | null;
  clock_elapsed_seconds: number;
  added_time_seconds: number;
}

export interface MatchEventRow {
  id: string;
  match_id: string;
  team_id: string | null;
  player_id: string | null;
  event_type: string;
  minute: number | null;
  description: string | null;
  value: number;
  undone: boolean;
  created_at: string;
}

export interface CommentaryRow {
  id: string;
  match_id: string;
  author_id: string | null;
  message: string;
  minute: number | null;
  is_pinned: boolean;
  is_highlight: boolean;
  created_at: string;
}

/**
 * Single subscription hook covering everything a live match view needs:
 * the match row, its live_scores row, the event timeline, and commentary.
 * Uses Supabase Realtime postgres_changes (already enabled on these four
 * tables in migration 0015/0027) so every connected client — scorekeeper,
 * commentator, or public viewer — gets the same updates with no polling.
 * Reconnection is handled by supabase-js itself (the channel resubscribes
 * automatically on network recovery); this hook additionally re-fetches a
 * fresh snapshot on reconnect in case any change was missed while offline.
 */
export function useRealtimeMatch(matchId: string | undefined) {
  const [match, setMatch] = useState<MatchRow | null>(null);
  const [liveScore, setLiveScore] = useState<LiveScoreRow | null>(null);
  const [events, setEvents] = useState<MatchEventRow[]>([]);
  const [commentary, setCommentary] = useState<CommentaryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  const fetchSnapshot = useCallback(async () => {
    if (!matchId) return;
    const [matchRes, scoreRes, eventsRes, commentaryRes] = await Promise.all([
      supabase.from("matches").select("*").eq("id", matchId).single(),
      supabase.from("live_scores").select("*").eq("match_id", matchId).maybeSingle(),
      supabase.from("match_events").select("*").eq("match_id", matchId).order("created_at", { ascending: true }),
      supabase.from("commentary").select("*").eq("match_id", matchId).order("created_at", { ascending: false }),
    ]);
    if (matchRes.data) setMatch(matchRes.data as MatchRow);
    if (scoreRes.data) setLiveScore(scoreRes.data as LiveScoreRow);
    setEvents((eventsRes.data ?? []) as MatchEventRow[]);
    setCommentary((commentaryRes.data ?? []) as CommentaryRow[]);
    setIsLoading(false);
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;
    fetchSnapshot();

    const channel = supabase
      .channel(`match:${matchId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "matches", filter: `id=eq.${matchId}` }, (payload) => {
        if (payload.eventType !== "DELETE") setMatch(payload.new as MatchRow);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "live_scores", filter: `match_id=eq.${matchId}` }, (payload) => {
        if (payload.eventType !== "DELETE") setLiveScore(payload.new as LiveScoreRow);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "match_events", filter: `match_id=eq.${matchId}` }, (payload) => {
        setEvents((prev) => {
          if (payload.eventType === "INSERT") return [...prev, payload.new as MatchEventRow];
          if (payload.eventType === "UPDATE") return prev.map((e) => (e.id === (payload.new as MatchEventRow).id ? (payload.new as MatchEventRow) : e));
          if (payload.eventType === "DELETE") return prev.filter((e) => e.id !== (payload.old as MatchEventRow).id);
          return prev;
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "commentary", filter: `match_id=eq.${matchId}` }, (payload) => {
        setCommentary((prev) => {
          if (payload.eventType === "INSERT") return [payload.new as CommentaryRow, ...prev];
          if (payload.eventType === "DELETE") return prev.filter((c) => c.id !== (payload.old as CommentaryRow).id);
          return prev;
        });
      })
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
        if (status === "SUBSCRIBED") fetchSnapshot();
      });

    const handleOnline = () => fetchSnapshot();
    window.addEventListener("online", handleOnline);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("online", handleOnline);
    };
  }, [matchId, fetchSnapshot]);

  return { match, liveScore, events, commentary, isLoading, isConnected, refetch: fetchSnapshot };
}
