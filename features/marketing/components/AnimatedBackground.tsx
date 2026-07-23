import { motion } from "framer-motion";

/**
 * Lightweight CSS/SVG gradient blobs with a slow drift animation — no
 * canvas, no WebGL, so it stays cheap on low-end mobile devices while still
 * giving the hero section a premium, alive feel.
 */
export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[var(--color-brand)]/20 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-24 top-32 h-80 w-80 rounded-full bg-[var(--color-accent)]/20 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[var(--color-warning)]/10 blur-3xl"
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
