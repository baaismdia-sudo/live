export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="h-3 w-20 rounded bg-[var(--color-surface-secondary)]" />
      <div className="mt-3 h-6 w-16 rounded bg-[var(--color-surface-secondary)]" />
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 rounded bg-[var(--color-surface-secondary)]" />
      ))}
    </div>
  );
}
