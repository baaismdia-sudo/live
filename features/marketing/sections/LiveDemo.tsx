import { useState } from "react";
import { motion } from "framer-motion";
import { SectionTitle } from "../components/SectionTitle";
import { Button } from "../components/Button";

const DEVICES = [
  { id: "desktop", label: "Desktop", frameClass: "w-full h-[420px]" },
  { id: "tablet", label: "Tablet", frameClass: "w-[420px] h-[420px] mx-auto" },
  { id: "mobile", label: "Mobile", frameClass: "w-[260px] h-[420px] mx-auto" },
] as const;

export function LiveDemo() {
  const [device, setDevice] = useState<(typeof DEVICES)[number]["id"]>("desktop");
  const active = DEVICES.find((d) => d.id === device)!;

  return (
    <section id="demo" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle eyebrow="Live Demo" title="See it before you build it" subtitle="Preview how your tournament site looks on any device." />

        <div className="mt-8 flex justify-center gap-2">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              onClick={() => setDevice(d.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                device === d.id
                  ? "bg-[var(--color-brand)] text-white"
                  : "bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <motion.div
          key={device}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`mt-10 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl ${active.frameClass}`}
        >
          <div className="flex h-9 items-center gap-1.5 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex h-[calc(100%-2.25rem)] flex-col items-center justify-center gap-3 bg-gradient-to-br from-[var(--color-brand)]/5 to-[var(--color-accent)]/5 p-6 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">Kodungallur Premier Cup 2026</p>
            <p className="text-4xl font-bold text-[var(--color-text)]">FC Kodungallur 2 – 1 Thrissur Titans</p>
            <p className="text-xs font-medium text-[var(--color-success)]">● Live · 67' Second Half</p>
          </div>
        </motion.div>

        <div className="mt-8 flex justify-center gap-3">
          <Button to="/demo" size="lg">Open demo</Button>
          <Button href="#" variant="ghost" size="lg">Watch live demo</Button>
        </div>
      </div>
    </section>
  );
}
