import type { MatchEventRow } from "../hooks/useRealtimeMatch";
import { getSportConfig } from "../data/sportEventConfigs";

export function Timeline({ events, sport, onUndo }: { events: MatchEventRow[]; sport: string; onUndo?: (eventId: string) => void }) {
  const config = getSportConfig(sport);
  const iconFor = (eventType: string) => config.quickActions.find((a) => a.eventType === eventType)?.icon ?? "•";
  const visible = [...events].filter((e) => !e.undone).reverse();

  if (visible.length === 0) {
    return <p className="py-8 text-center text-sm text-[var(--color-muted)]">No events yet.</p>;
  }

  return (
    <ul className="space-y-2.5">
      {visible.map((event) => (
        <li key={event.id} className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <span className="text-lg leading-none">{iconFor(event.event_type)}</span>
          <div className="flex-1">
            <p className="text-sm text-[var(--color-text)]">
              {event.minute !== null && <span className="mr-2 font-mono text-xs text-[var(--color-muted)]">{event.minute}'</span>}
              <span className="font-medium text-[var(--color-heading)] capitalize">{event.event_type.replace(/_/g, " ")}</span>
              {event.description && <span className="text-[var(--color-muted)]"> — {event.description}</span>}
            </p>
            <p className="mt-0.5 text-[10px] text-[var(--color-muted)]">{new Date(event.created_at).toLocaleTimeString()}</p>
          </div>
          {onUndo && (
            <button onClick={() => onUndo(event.id)} className="text-xs font-medium text-[var(--color-danger)] hover:underline">
              Undo
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
