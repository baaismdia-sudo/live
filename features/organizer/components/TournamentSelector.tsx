import type { TournamentOption } from "../hooks/useOrganizerTournaments";

export function TournamentSelector({
  tournaments,
  selectedId,
  onChange,
}: {
  tournaments: TournamentOption[];
  selectedId: string;
  onChange: (id: string) => void;
}) {
  if (tournaments.length === 0) return null;
  return (
    <select
      value={selectedId}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
    >
      {tournaments.map((t) => (
        <option key={t.id} value={t.id}>{t.name}</option>
      ))}
    </select>
  );
}
