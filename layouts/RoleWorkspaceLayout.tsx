import { Outlet, Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

/**
 * Lightweight shell for narrow-purpose roles (scorekeeper, commentator)
 * who need a fast, distraction-free workspace rather than a full sidebar
 * dashboard — they're here to control one match, not navigate a platform.
 */
export function RoleWorkspaceLayout({ label }: { label: string }) {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-heading font-semibold text-[var(--color-heading)]">
          <span className="inline-block h-7 w-7 rounded-lg" style={{ background: "var(--gradient-brand)" }} />
          TournamentLive <span className="text-[var(--color-muted)]">· {label}</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-[var(--color-muted)] sm:inline">{profile?.full_name}</span>
          <button onClick={toggleTheme} aria-label="Toggle theme" className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-surface-secondary)]">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/logout" className="text-sm font-medium text-[var(--color-danger)] hover:underline">Log out</Link>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
