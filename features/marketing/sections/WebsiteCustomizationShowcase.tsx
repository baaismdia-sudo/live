import { useState } from "react";
import { motion } from "framer-motion";
import { SectionTitle } from "../components/SectionTitle";

const SWATCHES = ["#1E3A8A", "#DC2626", "#059669", "#7C3AED", "#EA580C"];
const FONTS = ["Poppins", "Inter", "Playfair Display", "Space Grotesk"];

export function WebsiteCustomizationShowcase() {
  const [color, setColor] = useState(SWATCHES[0]);
  const [font, setFont] = useState(FONTS[0]);
  const [dark, setDark] = useState(false);

  return (
    <section className="bg-[var(--color-surface-alt)]/40 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle eyebrow="Website Builder" title="Make it unmistakably yours" subtitle="Try it — every control here maps to a real setting in your dashboard." />

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="space-y-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div>
              <p className="mb-2 text-sm font-medium text-[var(--color-text)]">Brand color</p>
              <div className="flex gap-2">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    aria-label={`Use color ${c}`}
                    className={`h-8 w-8 rounded-full border-2 ${color === c ? "border-[var(--color-text)]" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-[var(--color-text)]">Font</p>
              <div className="flex flex-wrap gap-2">
                {FONTS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFont(f)}
                    className={`rounded-lg border px-3 py-1.5 text-sm ${
                      font === f ? "border-[var(--color-brand)] text-[var(--color-brand)]" : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
              <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} className="rounded" />
              Dark mode preview
            </label>
            <ul className="space-y-1 text-xs text-[var(--color-text-muted)]">
              <li>✓ Logo & favicon</li>
              <li>✓ Homepage banner</li>
              <li>✓ Navigation & footer</li>
              <li>✓ Sponsor section</li>
              <li>✓ Gallery layout</li>
            </ul>
          </div>

          <motion.div
            animate={{ backgroundColor: dark ? "#171310" : "#FDFBF7" }}
            className="overflow-hidden rounded-2xl border border-[var(--color-border)] p-8 shadow-lg"
          >
            <div className="mb-4 h-8 w-24 rounded" style={{ backgroundColor: color }} />
            <h3 style={{ fontFamily: font, color: dark ? "#fff" : "#111" }} className="text-2xl font-semibold">
              Kodungallur Premier Cup
            </h3>
            <p className="mt-2 text-sm" style={{ color: dark ? "#ccc" : "#666" }}>
              The region's biggest 7-a-side football showdown.
            </p>
            <button className="mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: color }}>
              View Fixtures
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
