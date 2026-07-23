import { useState } from "react";
import type { QuickAction } from "../data/sportEventConfigs";

interface PlayerOption { id: string; full_name: string }

const TONE_CLASSES: Record<string, string> = {
  success: "border-[var(--color-success)]/40 text-[var(--color-success)] hover:bg-[var(--color-success)]/10",
  warning: "border-[var(--color-warning)]/40 text-[var(--color-warning)] hover:bg-[var(--color-warning)]/10",
  danger: "border-[var(--color-danger)]/40 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10",
  info: "border-[var(--color-info)]/40 text-[var(--color-info)] hover:bg-[var(--color-info)]/10",
};

export function QuickActionButtons({
  actions,
  homePlayers,
  awayPlayers,
  onAction,
}: {
  actions: QuickAction[];
  homePlayers: PlayerOption[];
  awayPlayers: PlayerOption[];
  onAction: (action: QuickAction, team: "home" | "away", playerId?: string, value?: number) => void;
}) {
  const [pending, setPending] = useState<{ action: QuickAction; team: "home" | "away" } | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [numericValue, setNumericValue] = useState("1");

  const confirmPending = () => {
    if (!pending) return;
    onAction(pending.action, pending.team, selectedPlayer || undefined, pending.action.promptValue ? Number(numericValue) : undefined);
    setPending(null);
    setSelectedPlayer("");
    setNumericValue("1");
  };

  const players = pending?.team === "home" ? homePlayers : awayPlayers;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {(["home", "away"] as const).map((team) => (
          <div key={team} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{team} team</p>
            <div className="grid grid-cols-2 gap-1.5">
              {actions.map((action) => (
                <button
                  key={`${team}-${action.eventType}-${action.label}`}
                  onClick={() => (action.requiresPlayer || action.promptValue ? setPending({ action, team }) : onAction(action, team))}
                  className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-medium transition ${TONE_CLASSES[action.tone ?? "info"]}`}
                >
                  <span>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setPending(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-card bg-[var(--color-surface)] p-5 shadow-2xl">
            <p className="font-heading text-sm font-semibold text-[var(--color-heading)]">{pending.action.icon} {pending.action.label}</p>
            {pending.action.requiresPlayer && (
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="mt-3 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">Select player</option>
                {players.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            )}
            {pending.action.promptValue && (
              <input
                type="number"
                value={numericValue}
                onChange={(e) => setNumericValue(e.target.value)}
                className="mt-3 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            )}
            <div className="mt-4 flex gap-2">
              <button onClick={() => setPending(null)} className="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium">Cancel</button>
              <button onClick={confirmPending} className="flex-1 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
