import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  tone = "primary",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { direction: "up" | "down"; value: string };
  tone?: "primary" | "secondary" | "accent" | "success" | "warning";
}) {
  const tones: Record<string, string> = {
    primary: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    secondary: "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]",
    accent: "bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
    success: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    warning: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  };

  return (
    <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--color-muted)]">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold text-[var(--color-heading)]">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon size={18} />
        </div>
      </div>
      {trend && (
        <p className={`mt-3 flex items-center gap-1 text-xs font-medium ${trend.direction === "up" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
          {trend.direction === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trend.value}
        </p>
      )}
    </div>
  );
}
