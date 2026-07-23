import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionTitle } from "../components/SectionTitle";

const WIDGETS = {
  Football: { home: "FC Kodungallur", away: "Thrissur Titans", score: "2 – 1", detail: "67' · 2nd Half", extra: ["⚽ Goal 34'", "🟨 Card 52'"] },
  Cricket: { home: "Cochin XI", away: "Malabar CC", score: "142/4", detail: "Overs 16.3 · Need 38 off 21", extra: ["Wickets: 4", "CRR: 8.6"] },
  Basketball: { home: "Calicut Hawks", away: "Trivandrum Titans", score: "78 – 74", detail: "Q4 · 2:14 remaining", extra: ["Fouls: 3", "Timeouts: 1"] },
  Volleyball: { home: "Kannur Smashers", away: "Kollam Spikers", score: "2 – 1", detail: "Set 4 · 18-15", extra: ["Sets Won: 2", "Aces: 6"] },
} as const;

type SportKey = keyof typeof WIDGETS;

export function LiveScoreShowcase() {
  const [sport, setSport] = useState<SportKey>("Football");
  const widget = WIDGETS[sport];

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <SectionTitle eyebrow="Live Score Engine" title="One scoreboard, every sport" />

        <div className="mt-8 flex justify-center gap-2">
          {(Object.keys(WIDGETS) as SportKey[]).map((s) => (
            <button
              key={s}
              onClick={() => setSport(s)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                sport === s ? "bg-[var(--color-brand)] text-white" : "bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={sport}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="mx-auto mt-8 max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg"
          >
            <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--color-success)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-success)]" /> LIVE
            </p>
            <div className="mt-3 flex items-center justify-between text-lg font-semibold text-[var(--color-text)]">
              <span>{widget.home}</span>
              <span className="text-2xl text-[var(--color-brand)]">{widget.score}</span>
              <span>{widget.away}</span>
            </div>
            <p className="mt-2 text-center text-xs text-[var(--color-text-muted)]">{widget.detail}</p>
            <div className="mt-4 flex justify-center gap-4 text-xs text-[var(--color-text-muted)]">
              {widget.extra.map((e) => (
                <span key={e}>{e}</span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
