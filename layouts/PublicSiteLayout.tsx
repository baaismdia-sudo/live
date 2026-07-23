import { useState } from "react";
import { Outlet, Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, Search } from "lucide-react";
import { useTournamentSite } from "../features/publicSite/hooks/useTournamentSite";
import { usePublicSiteTheme } from "../features/publicSite/hooks/usePublicSiteTheme";
import { PageLoader } from "../components/ui/LoadingSpinner";
import { ErrorState } from "../components/ui/ErrorState";
import { Seo } from "../components/seo/Seo";

const NAV_ITEMS = (slug: string) => [
  { label: "Home", to: `/tournament/${slug}` },
  { label: "Live Scores", to: `/tournament/${slug}/live` },
  { label: "Fixtures", to: `/tournament/${slug}/fixtures` },
  { label: "Results", to: `/tournament/${slug}/results` },
  { label: "Points Table", to: `/tournament/${slug}/points-table` },
  { label: "Teams", to: `/tournament/${slug}/teams` },
  { label: "Players", to: `/tournament/${slug}/players` },
  { label: "Statistics", to: `/tournament/${slug}/statistics` },
  { label: "Gallery", to: `/tournament/${slug}/gallery` },
  { label: "News", to: `/tournament/${slug}/news` },
];

export default function PublicSiteLayout() {
  const { tournament, theme, siteSettings, seo, isLoading, notFound } = useTournamentSite();
  const { mode, toggleMode, cssVars } = usePublicSiteTheme(theme);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  if (isLoading) return <PageLoader label="Loading tournament site..." />;
  if (notFound || !tournament) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <ErrorState title="Tournament not found" message="This tournament site doesn't exist or isn't published yet." />
      </div>
    );
  }

  if (siteSettings?.maintenance_mode) {
    return (
      <div style={cssVars} data-public-theme={mode} className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--color-background)] p-6 text-center">
        <p className="font-heading text-xl font-semibold text-[var(--color-heading)]">We'll be back shortly</p>
        <p className="text-sm text-[var(--color-muted)]">{tournament.name} is undergoing maintenance.</p>
      </div>
    );
  }

  return (
    <div style={cssVars} data-public-theme={mode} className="min-h-screen bg-[var(--color-background)] font-body">
      <Seo
        title={seo?.meta_title ?? tournament.name}
        description={seo?.meta_description ?? tournament.description ?? `Live scores, fixtures, and results for ${tournament.name}`}
        path={location.pathname}
        imageUrl={seo?.og_image_url ?? tournament.cover_image_url ?? undefined}
      />

      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to={`/tournament/${tournament.slug}`} className="flex items-center gap-2.5">
            {tournament.logo_url ? (
              <img src={tournament.logo_url} alt={tournament.name} className="h-9 w-9 rounded-lg object-cover" loading="lazy" />
            ) : (
              <span className="inline-block h-9 w-9 rounded-lg" style={{ background: "var(--gradient-brand)" }} />
            )}
            <span className="font-heading text-base font-bold text-[var(--color-heading)]">{siteSettings?.site_title ?? tournament.name}</span>
          </Link>

          <nav className="hidden items-center gap-5 lg:flex">
            {NAV_ITEMS(tournament.slug).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === `/tournament/${tournament.slug}`}
                className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text)] hover:text-[var(--color-primary)]"}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to={`/tournament/${tournament.slug}/search`} aria-label="Search" className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-surface-secondary)]">
              <Search size={18} />
            </Link>
            <button onClick={toggleMode} aria-label="Toggle dark mode" className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-surface-secondary)]">
              {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu" className="rounded-lg p-2 text-[var(--color-text)] lg:hidden">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="flex flex-col gap-1 border-t border-[var(--color-border)] px-4 py-3 lg:hidden">
            {NAV_ITEMS(tournament.slug).map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)]">
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet context={{ tournament, theme, siteSettings, seo }} />
      </main>

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-heading font-semibold text-[var(--color-heading)]">{tournament.name}</p>
              {siteSettings?.tagline && <p className="text-sm text-[var(--color-muted)]">{siteSettings.tagline}</p>}
            </div>
            <div className="flex gap-4 text-sm text-[var(--color-muted)]">
              <Link to={`/tournament/${tournament.slug}/about`} className="hover:text-[var(--color-primary)]">About</Link>
              <Link to={`/tournament/${tournament.slug}/contact`} className="hover:text-[var(--color-primary)]">Contact</Link>
              <Link to={`/tournament/${tournament.slug}/privacy`} className="hover:text-[var(--color-primary)]">Privacy</Link>
              <Link to={`/tournament/${tournament.slug}/terms`} className="hover:text-[var(--color-primary)]">Terms</Link>
            </div>
          </div>
          <p className="mt-6 text-xs text-[var(--color-muted)]">{siteSettings?.footer_text ?? `© ${new Date().getFullYear()} ${tournament.name}. Powered by TournamentLive.`}</p>
        </div>
      </footer>
    </div>
  );
}
