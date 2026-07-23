import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function FeatureCard({
  icon,
  title,
  description,
  index = 0,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -4 }}
      className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-shadow hover:shadow-lg hover:shadow-[var(--color-brand)]/5"
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-brand)]/10 text-xl text-[var(--color-brand)] transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="font-semibold text-[var(--color-text)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{description}</p>
    </motion.div>
  );
}
