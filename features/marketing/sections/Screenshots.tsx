import { useState } from "react";
import { motion } from "framer-motion";
import { SectionTitle } from "../components/SectionTitle";
import { SCREENSHOTS } from "../data/content";

export function Screenshots() {
  const [index, setIndex] = useState(0);
  const shot = SCREENSHOTS[index];

  return (
    <section className="bg-[var(--color-surface-alt)]/40 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <SectionTitle eyebrow="See it in action" title="A look inside TournamentLive" />

        <motion.div
          key={shot.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-auto mt-10 flex h-72 max-w-2xl flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
        >
          <span className="text-6xl">{shot.emoji}</span>
          <p className="text-sm font-medium text-[var(--color-text-muted)]">{shot.title}</p>
        </motion.div>

        <div className="mt-6 flex justify-center gap-2">
          {SCREENSHOTS.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setIndex(i)}
              aria-label={`Show ${s.title} screenshot`}
              className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-[var(--color-brand)]" : "w-2 bg-[var(--color-border)]"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
