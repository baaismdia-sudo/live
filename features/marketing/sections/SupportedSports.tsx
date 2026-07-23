import { motion } from "framer-motion";
import { SectionTitle } from "../components/SectionTitle";
import { SPORTS } from "../data/content";

export function SupportedSports() {
  return (
    <section id="sports" className="bg-[var(--color-surface-alt)]/40 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle eyebrow="Sports" title="Built for every sport" subtitle="Configurable scoring and formats for each." />
        <div className="mt-12 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {SPORTS.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
              whileHover={{ y: -3 }}
              className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center"
            >
              <span className="text-3xl">{s.icon}</span>
              <span className="text-xs font-medium text-[var(--color-text-muted)]">{s.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
