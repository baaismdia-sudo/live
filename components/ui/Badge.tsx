const ROLE_COLOR: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  organizer: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  manager: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  scorekeeper: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  commentator: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
  viewer: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  guest: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export function RoleBadge({ role, label }: { role: string; label: string }) {
  const classes = ROLE_COLOR[role] ?? ROLE_COLOR.guest;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}

export function PermissionBadge({ code }: { code: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[var(--color-surface-alt)] px-2 py-0.5 font-mono text-[11px] text-[var(--color-text-muted)]">
      {code}
    </span>
  );
}

const STATUS_COLOR: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  suspended: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
};

export function AccountStatusBadge({ status }: { status: "active" | "suspended" | "pending" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLOR[status]}`}>
      {status}
    </span>
  );
}
