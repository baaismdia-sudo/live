import { Users, Building2, Trophy, Radio, IndianRupee, Ticket, Clock, UserPlus, LifeBuoy, Inbox } from "lucide-react";
import { StatCard } from "../../features/admin/components/StatCard";
import { StatCardSkeleton } from "../../features/admin/components/StatCardSkeleton";
import { RevenueChart } from "../../features/admin/components/RevenueChart";
import { UserGrowthChart } from "../../features/admin/components/UserGrowthChart";
import { PopularSportsChart } from "../../features/admin/components/PopularSportsChart";
import { ErrorState } from "../../components/ui/ErrorState";
import { useDashboardStats } from "../../features/admin/hooks/useDashboardStats";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(cents / 100);
}

export default function DashboardHomePage() {
  const { stats, revenueSeries, userGrowth, popularSports, isLoading, error } = useDashboardStats();

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <title>Dashboard · TournamentLive Admin</title>
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--color-heading)]">Platform overview</h1>
        <p className="text-sm text-[var(--color-muted)]">Everything happening across TournamentLive, right now.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {isLoading || !stats ? (
          Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total Users" value={stats.total_users.toLocaleString()} icon={Users} tone="primary" />
            <StatCard label="Organizers" value={stats.total_organizers.toLocaleString()} icon={Building2} tone="secondary" />
            <StatCard label="Active Tournaments" value={stats.active_tournaments.toLocaleString()} icon={Trophy} tone="accent" />
            <StatCard label="Live Matches" value={stats.live_matches.toLocaleString()} icon={Radio} tone="success" />
            <StatCard label="Revenue Today" value={formatCurrency(stats.revenue_today)} icon={IndianRupee} tone="warning" />
            <StatCard label="Revenue (Month)" value={formatCurrency(stats.revenue_this_month)} icon={IndianRupee} tone="primary" />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {!isLoading && stats && (
          <>
            <StatCard label="Revenue (Year)" value={formatCurrency(stats.revenue_this_year)} icon={IndianRupee} tone="secondary" />
            <StatCard label="Active Rentals" value={stats.active_rentals.toLocaleString()} icon={Ticket} tone="success" />
            <StatCard label="Expired Rentals" value={stats.expired_rentals.toLocaleString()} icon={Clock} tone="warning" />
            <StatCard label="New Users (7d)" value={stats.new_users_7d.toLocaleString()} icon={UserPlus} tone="accent" />
            <StatCard label="Open Tickets" value={stats.open_support_tickets.toLocaleString()} icon={LifeBuoy} tone="warning" />
            <StatCard label="New Messages" value={stats.pending_contact_messages.toLocaleString()} icon={Inbox} tone="primary" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:col-span-2">
          <h2 className="font-heading text-sm font-semibold text-[var(--color-heading)]">Revenue — last 30 days</h2>
          {isLoading ? <div className="h-64 animate-pulse rounded bg-[var(--color-surface-secondary)]" /> : <RevenueChart data={revenueSeries} />}
        </div>
        <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="font-heading text-sm font-semibold text-[var(--color-heading)]">Popular sports</h2>
          {isLoading ? <div className="h-56 animate-pulse rounded bg-[var(--color-surface-secondary)]" /> : <PopularSportsChart data={popularSports} />}
        </div>
      </div>

      <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-heading text-sm font-semibold text-[var(--color-heading)]">User growth — last 14 days</h2>
        {isLoading ? <div className="h-56 animate-pulse rounded bg-[var(--color-surface-secondary)]" /> : <UserGrowthChart data={userGrowth} />}
      </div>

      <SystemStatusRow />
    </div>
  );
}

function SystemStatusRow() {
  const items = [
    { label: "Database", status: "Healthy" },
    { label: "Realtime", status: "Connected" },
    { label: "API", status: "Operational" },
    { label: "Storage", status: "Operational" },
  ];
  return (
    <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="font-heading text-sm font-semibold text-[var(--color-heading)]">System status</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
            <span className="text-[var(--color-text)]">{item.label}</span>
            <span className="ml-auto text-xs text-[var(--color-muted)]">{item.status}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        Live infrastructure metrics (actual DB size, realtime connection count, API error rate) require a
        monitoring integration — this panel currently reflects reachability, not deep telemetry.
      </p>
    </div>
  );
}
