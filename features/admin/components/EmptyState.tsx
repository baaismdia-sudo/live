import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-muted)]">
        <Icon size={24} />
      </div>
      <p className="font-medium text-[var(--color-heading)]">{title}</p>
      {description && <p className="max-w-sm text-sm text-[var(--color-muted)]">{description}</p>}
      {action}
    </div>
  );
}
