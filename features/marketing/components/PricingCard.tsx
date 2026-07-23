import { motion } from "framer-motion";
import { Button } from "./Button";

export interface PricingPlan {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  duration: string;
  features: string[];
  isPopular?: boolean;
  discountBadge?: string;
}

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

export function PricingCard({ plan, index = 0 }: { plan: PricingPlan; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.4) }}
      className={`relative flex flex-col rounded-2xl border p-6 ${
        plan.isPopular
          ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5 shadow-lg shadow-[var(--color-brand)]/10"
          : "border-[var(--color-border)] bg-[var(--color-surface)]"
      }`}
    >
      {plan.isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-brand)] px-3 py-1 text-xs font-semibold text-white">
          Most popular
        </span>
      )}
      {plan.discountBadge && (
        <span className="absolute -top-3 right-4 rounded-full bg-[var(--color-success)] px-2.5 py-1 text-xs font-semibold text-white">
          {plan.discountBadge}
        </span>
      )}
      <h3 className="font-semibold text-[var(--color-text)]">{plan.name}</h3>
      <p className="mt-3 text-3xl font-semibold text-[var(--color-text)]">
        {formatPrice(plan.priceCents, plan.currency)}
      </p>
      <p className="text-sm text-[var(--color-text-muted)]">per {plan.duration}</p>
      <ul className="mt-5 flex-1 space-y-2.5 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[var(--color-text-muted)]">
            <span className="mt-0.5 text-[var(--color-success)]">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <Button to="/register" variant={plan.isPopular ? "primary" : "ghost"} className="mt-6 w-full">
        Get started
      </Button>
    </motion.div>
  );
}
