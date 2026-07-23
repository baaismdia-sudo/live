import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Search, Bell, Sun, Moon, Menu, X, ChevronRight, Plus } from "lucide-react";
import { SIDEBAR_GROUPS } from "../features/admin/data/sidebar";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const breadcrumb = SIDEBAR_GROUPS.flatMap((g) => g.items).find((item) => item.to === location.pathname);

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Sidebar — desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] lg:flex">
        <SidebarContent />
      </aside>

      {/* Sidebar — mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-[var(--color-surface)] shadow-2xl">
            <div className="flex justify-end p-3">
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="rounded-lg p-2 hover:bg-[var(--color-surface-secondary)]">
                <X size={20} />
              </button>
            </div>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="rounded-lg p-2 hover:bg-[var(--color-surface-secondary)] lg:hidden">
              <Menu size={20} />
            </button>
            <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-sm text-[var(--color-muted)] sm:flex">
              <Link to="/admin" className="hover:text-[var(--color-text)]">Admin</Link>
              {breadcrumb && breadcrumb.to !== "/admin" && (
                <>
                  <ChevronRight size={14} />
                  <span className="text-[var(--color-heading)]">{breadcrumb.label}</span>
                </>
              )}
            </nav>
          </div>

          <div className="hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3 py-2 sm:flex">
            <Search size={16} className="text-[var(--color-muted)]" />
            <input
              placeholder="Search users, tournaments, payments..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-muted)]"
            />
            <kbd className="rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-muted)]">⌘K</kbd>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/tournaments"
              className="hidden items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] sm:flex"
            >
              <Plus size={16} /> Quick action
            </Link>
            <button onClick={toggleTheme} aria-label="Toggle theme" className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-surface-secondary)]">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button aria-label="Notifications" className="relative rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-surface-secondary)]">
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-danger)]" />
            </button>
            <Link to="/account/profile" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--color-surface-secondary)]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-sm font-semibold text-[var(--color-primary)]">
                {profile?.full_name?.charAt(0).toUpperCase() ?? "A"}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-5 py-5">
        <span
          className="inline-block h-8 w-8 rounded-lg"
          style={{ background: "var(--gradient-brand)" }}
        />
        <span className="font-heading text-lg font-bold text-[var(--color-heading)]">TournamentLive</span>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              {group.title}
            </p>
            <div className="mt-1.5 space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/admin"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)]"
                    }`
                  }
                >
                  <item.icon size={17} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </>
  );
}
