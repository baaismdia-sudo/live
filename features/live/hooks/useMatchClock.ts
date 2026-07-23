import { useEffect, useState } from "react";
import type { LiveScoreRow } from "./useRealtimeMatch";

/**
 * Ticking display derived from the server-authoritative clock fields on
 * live_scores (clock_status, clock_started_at, clock_elapsed_seconds).
 * The clock itself is NOT run client-side and pushed — every client
 * (scorekeeper, commentator, viewers) computes the same displayed time
 * from the same server timestamp, which is what "auto sync" means here:
 * no client can drift out of sync with another, and a page refresh at any
 * moment shows the correct elapsed time immediately.
 */
export function useMatchClock(liveScore: LiveScoreRow | null) {
  const [displaySeconds, setDisplaySeconds] = useState(0);

  useEffect(() => {
    if (!liveScore) return;

    const compute = () => {
      if (liveScore.clock_status === "running" && liveScore.clock_started_at) {
        const startedAt = new Date(liveScore.clock_started_at).getTime();
        const elapsedSinceStart = Math.floor((Date.now() - startedAt) / 1000);
        setDisplaySeconds(liveScore.clock_elapsed_seconds + elapsedSinceStart);
      } else {
        setDisplaySeconds(liveScore.clock_elapsed_seconds);
      }
    };

    compute();
    if (liveScore.clock_status !== "running") return;
    const interval = setInterval(compute, 1000);
    return () => clearInterval(interval);
  }, [liveScore]);

  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;
  const addedMinutes = liveScore ? Math.floor(liveScore.added_time_seconds / 60) : 0;

  return {
    displaySeconds,
    formatted: `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
    addedTimeFormatted: addedMinutes > 0 ? `+${addedMinutes}` : null,
    minutes,
  };
}
