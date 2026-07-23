import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { CreditCard } from "lucide-react";

interface Subscription {
  id: string;
  status: string;
  starts_at: string;
  ends_at: string;
  auto_renew: boolean;
  rental_plans: { name: string; duration: string; price_cents: number; currency: string } | null;
}

function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("subscriptions")
      .select("*, rental_plans(name, duration, price_cents, currency)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSubscriptions((data ?? []) as unknown as Subscription[]);
        setIsLoading(false);
      });
  }, []);

  const statusColor: Record<string, string> = {
    active: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    trialing: "bg-[var(--color-info)]/10 text-[var(--color-info)]",
    past_due: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
    cancelled: "bg-[var(--color-muted)]/10 text-[var(--color-muted)]",
    expired: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  };

  if (isLoading) return <PageLoader label="Loading subscriptions..." />;

  return (
    <div className="space-y-6 p-6">
      <title>Subscription · TournamentLive</title>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--color-heading)]">Subscription</h1>
          <p className="text-sm text-[var(--color-muted)]">Your rental history across all tournaments.</p>
        </div>
        <Link to="/dashboard/subscription/enquire" className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]">
          Activate or renew a rental
        </Link>
      </div>

      {subscriptions.length === 0 ? (
        <EmptyState icon={CreditCard} title="No subscriptions yet" description="Rental plans are selected when you create a tournament." />
      ) : (
        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div>
                <p className="font-medium text-[var(--color-heading)]">{sub.rental_plans?.name ?? "Plan"}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {new Date(sub.starts_at).toLocaleDateString()} → {new Date(sub.ends_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {sub.rental_plans && <span className="text-sm font-medium text-[var(--color-heading)]">{formatCurrency(sub.rental_plans.price_cents, sub.rental_plans.currency)}</span>}
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor[sub.status]}`}>{sub.status.replace("_", " ")}</span>
                {(sub.status === "expired" || sub.status === "cancelled") && (
                  <Link to="/dashboard/subscription/enquire" className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-primary-hover)]">
                    Renew
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-[var(--color-muted)]">
        "Activate or renew" opens the WhatsApp enquiry flow — Super Admin reviews and activates it manually
        from Admin → Rental Enquiries, and you'll get an email plus in-app notification once it's live.
      </p>
    </div>
  );
}
