import { motion } from "framer-motion";
import { Button } from "../components/Button";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { FloatingCard } from "../components/FloatingCard";
import { StatsCounter } from "../components/StatsCounter";
import { STATS } from "../data/content";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-16 sm:pt-24">
      <AnimatedBackground />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl"
          >
            Your tournament,
            <br />
            <span className="text-[var(--color-brand)]">live in minutes.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 max-w-lg text-lg text-[var(--color-text-muted)]"
          >
            Rent a fully branded tournament website with live scores, fixtures, and standings —
            no code, no developer, no waiting.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button to="/register" size="lg">Start free</Button>
            <Button to="/demo" variant="ghost" size="lg">Watch demo</Button>
            <Button href="/contact" variant="secondary" size="lg">Request demo</Button>
          </motion.div>

          <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((s) => (
              <StatsCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
            ))}
          </div>
        </div>

        <div className="relative hidden h-[420px] lg:block">
          <FloatingCard className="absolute left-0 top-4 w-56" delay={0}>
            <p className="text-xs text-[var(--color-text-muted)]">Kodungallur Premier Cup</p>
            <p className="mt-1 flex items-center justify-between text-2xl font-semibold text-[var(--color-text)]">
              <span>FC Kodungallur</span>
            </p>
            <p className="text-3xl font-bold text-[var(--color-brand)]">2 – 1</p>
            <p className="mt-1 text-xs text-[var(--color-success)]">● Live · 67'</p>
          </FloatingCard>
          <FloatingCard className="absolute right-0 top-40 w-52" delay={0.6}>
            <p className="text-xs text-[var(--color-text-muted)]">Points Table</p>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between"><span>Thrissur Titans</span><span className="font-semibold">9 pts</span></div>
              <div className="flex justify-between"><span>Cochin Crusaders</span><span className="font-semibold">7 pts</span></div>
            </div>
          </FloatingCard>
          <FloatingCard className="absolute bottom-0 left-10 w-48" delay={1.1}>
            <p className="text-xs text-[var(--color-text-muted)]">New sponsor</p>
            <p className="mt-1 font-semibold text-[var(--color-text)]">Chocolush 🍫</p>
          </FloatingCard>
        </div>
      </div>
    </section>
  );
}
