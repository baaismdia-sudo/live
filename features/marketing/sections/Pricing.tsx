import { SectionTitle } from "../components/SectionTitle";
import { PricingCard } from "../components/PricingCard";
import { usePricingPlans } from "../hooks/usePricingPlans";
import { PageLoader } from "../../../components/ui/LoadingSpinner";
import { ErrorState } from "../../../components/ui/ErrorState";

export function Pricing() {
  const { plans, isLoading, error } = usePricingPlans();

  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle eyebrow="Pricing" title="Rent exactly the time you need" subtitle="No subscriptions, no surprise renewals — pay once per tournament." />

        <div className="mt-14">
          {isLoading ? (
            <PageLoader label="Loading plans..." />
          ) : error ? (
            <ErrorState message={error} />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan, i) => (
                <PricingCard key={plan.id} plan={plan} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
