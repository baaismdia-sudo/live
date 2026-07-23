import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { PricingPlan } from "../components/PricingCard";

const DURATION_LABEL: Record<string, string> = {
  "1_day": "day",
  "3_day": "3 days",
  "1_week": "week",
  "2_week": "2 weeks",
  "1_month": "month",
  unlimited: "tournament",
};

/**
 * Pricing loads live from `rental_plans` (public RLS read for is_active=true,
 * set up in Prompt 2) rather than the static content file, since pricing is
 * explicitly required to be database-driven, not hardcoded in the landing page.
 */
export function usePricingPlans() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("rental_plans")
      .select("id, name, slug, duration, price_cents, currency, features")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error: fetchError }) => {
        if (!mounted) return;
        if (fetchError) {
          setError(fetchError.message);
          setIsLoading(false);
          return;
        }
        const mapped: PricingPlan[] = (data ?? []).map((row, i) => ({
          id: row.id,
          name: row.name,
          priceCents: row.price_cents,
          currency: row.currency,
          duration: DURATION_LABEL[row.duration] ?? row.duration,
          features: (row.features as string[]) ?? [],
          isPopular: row.slug === "1-week",
          discountBadge: i === (data?.length ?? 0) - 1 ? "Best value" : undefined,
        }));
        setPlans(mapped);
        setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { plans, isLoading, error };
}
