import { motion } from "framer-motion";
import { SectionTitle } from "../components/SectionTitle";
import { HOW_IT_WORKS } from "../data/content";

export function HowItWorks() {
  return (
    <section className="bg-[var(--color-surface-alt)]/40 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle eyebrow="How it works" title="From sign-up to live scores in 8 steps" />
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: Math.min(i * 0.06, 0.4), duration: 0.4 }}
              className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <span className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand)] text-xs font-bold text-white">
                {step.step}
              </span>
              <span className="text-3xl">{step.icon}</span>
              <h3 className="mt-3 font-semibold text-[var(--color-text)]">{step.title}</h3>
              <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
