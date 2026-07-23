import { Trophy, Swords, Radio, CheckCircle2, ShieldHalf, User, CreditCard, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { StatCard } from "../../features/admin/components/StatCard";
import { StatCardSkeleton } from "../../features/admin/components/StatCardSkeleton";
import { useOrganizerStats } from "../../features/organizer/hooks/useOrganizerStats";
import { ErrorState } from "../../components/ui/ErrorState";

export default function DashboardHomePage() {
  const { stats, isLoading, error } = useOrganizerStats();

  if (error) return <div className="p-6"><ErrorState message={error} /></div>;

  const daysToExpiry = stats?.nearest_rental_expiry
    ? Math.max(0, Math.ceil((new Date(stats.nearest_rental_expiry).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="space-y-8 p-6">
      <title>Dashboard · TournamentLive</title>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-heading)]">Welcome back</h1>
          <p className="text-sm text-[var(--color-muted)]">Here's what's happening across your tournaments.</p>
        </div>
        <Link to="/dashboard/tournaments/new" className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]">
          + Create tournament
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading || !stats ? (
          Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Active Tournaments" value={stats.active_tournaments.toLocaleString()} icon={Trophy} tone="primary" />
            <StatCard label="Upcoming Matches" value={stats.upcoming_matches.toLocaleString()} icon={Swords} tone="secondary" />
            <StatCard label="Live Matches" value={stats.live_matches.toLocaleString()} icon={Radio} tone="success" />
            <StatCard label="Completed Matches" value={stats.completed_matches.toLocaleString()} icon={CheckCircle2} tone="accent" />
            <StatCard label="Teams" value={stats.total_teams.toLocaleString()} icon={ShieldHalf} tone="primary" />
            <StatCard label="Players" value={stats.total_players.toLocaleString()} icon={User} tone="secondary" />
            <StatCard
              label="Subscription"
              value={stats.active_subscription_status ? stats.active_subscription_status : "None"}
              icon={CreditCard}
              tone={stats.active_subscription_status === "active" ? "success" : "warning"}
            />
            <StatCard
              label="Nearest Rental Expiry"
              value={daysToExpiry !== null ? `${daysToExpiry}d` : "—"}
              icon={Clock}
              tone={daysToExpiry !== null && daysToExpiry <= 7 ? "warning" : "accent"}
            />
          </>
        )}
      </div>

      <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
        <p className="text-sm text-[var(--color-muted)]">
          Visitor analytics, live-viewer counts, and page-popularity charts need a tracking pipeline on the
          public tournament sites first (Prompt 7+). Once that's wired up, this space becomes the Visitors /
          Match Activity / Live Viewers / Popular Pages charts from the spec — not built as fake numbers here.
        </p>
      </div>
    </div>
  );
}
