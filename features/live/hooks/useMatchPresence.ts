import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../../contexts/AuthContext";

export interface PresenceUser {
  profileId: string;
  fullName: string;
  role: "scorekeeper" | "commentator" | "viewer";
  onlineAt: string;
}

/**
 * Supabase Realtime Presence for a match channel. Scorekeepers/commentators
 * show up so an organizer can see who's actively controlling a match; the
 * "only one active scorekeeper" behavior this enables is advisory UX (a
 * visible warning if someone else is already controlling), not a second
 * authorization layer — RLS via is_tournament_scorekeeper() remains the
 * actual write boundary regardless of what presence shows.
 */
export function useMatchPresence(matchId: string | undefined, role: PresenceUser["role"]) {
  const { profile } = useAuth();
  const [presentUsers, setPresentUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!matchId || !profile) return;

    const channel = supabase.channel(`presence:match:${matchId}`, {
      config: { presence: { key: profile.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceUser>();
        const users = Object.values(state).flat();
        setPresentUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            profileId: profile.id,
            fullName: profile.full_name,
            role,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, profile, role]);

  return { presentUsers };
}
