import { Play, Pause, Square, Plus } from "lucide-react";
import { useMatchClock } from "../hooks/useMatchClock";
import type { LiveScoreRow } from "../hooks/useRealtimeMatch";

export function MatchClockControl({
  liveScore, onStart, onPause, onResume, onEnd, onAddTime,
}: {
  liveScore: LiveScoreRow | null;
  onStart: () => void;
  onPause: (elapsedSeconds: number) => void;
  onResume: () => void;
  onEnd: () => void;
  onAddTime: (seconds: number) => void;
}) {
  const clock = useMatchClock(liveScore);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div>
        <p className="font-mono text-3xl font-bold text-[var(--color-heading)]">{clock.formatted}</p>
        {clock.addedTimeFormatted && <p className="text-xs text-[var(--color-warning)]">Added time {clock.addedTimeFormatted}'</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {(!liveScore || liveScore.clock_status === "stopped") && (
          <button onClick={onStart} className="flex items-center gap-1.5 rounded-lg bg-[var(--color-success)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            <Play size={15} /> Start
          </button>
        )}
        {liveScore?.clock_status === "running" && (
          <button onClick={() => onPause(clock.displaySeconds)} className="flex items-center gap-1.5 rounded-lg bg-[var(--color-warning)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            <Pause size={15} /> Pause
          </button>
        )}
        {liveScore?.clock_status === "paused" && (
          <button onClick={onResume} className="flex items-center gap-1.5 rounded-lg bg-[var(--color-success)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            <Play size={15} /> Resume
          </button>
        )}
        <button onClick={() => onAddTime(60)} className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium hover:bg-[var(--color-surface-secondary)]">
          <Plus size={15} /> 1 min
        </button>
        <button onClick={onEnd} className="flex items-center gap-1.5 rounded-lg bg-[var(--color-danger)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          <Square size={15} /> End match
        </button>
      </div>
    </div>
  );
}
