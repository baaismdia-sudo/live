interface Sponsor { id: string; name: string; logo_url: string | null; website_url: string | null; tier: string }

const TIER_ORDER = ["platinum", "gold", "silver", "bronze"];

export function SponsorStrip({ sponsors }: { sponsors: Sponsor[] }) {
  const sorted = [...sponsors].sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      {sorted.map((s) => (
        <a key={s.id} href={s.website_url ?? "#"} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1.5 opacity-80 transition hover:opacity-100">
          <div className="flex h-14 w-24 items-center justify-center rounded-lg bg-[var(--color-surface-secondary)]">
            {s.logo_url ? <img src={s.logo_url} alt={s.name} className="max-h-10 max-w-20 object-contain" loading="lazy" /> : <span className="text-xs text-[var(--color-muted)]">{s.name}</span>}
          </div>
          <span className="text-[10px] capitalize text-[var(--color-muted)]">{s.tier}</span>
        </a>
      ))}
    </div>
  );
}
