import { motion } from "framer-motion";
import { TRUSTED_BY } from "../data/content";

export function TrustedBy() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface-alt)]/40 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          Trusted by organizers across India
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {TRUSTED_BY.map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-sm font-medium text-[var(--color-text-muted)] grayscale transition hover:grayscale-0"
            >
              {name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
