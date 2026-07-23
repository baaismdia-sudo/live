import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/Button";

const NAV_LINKS = [
  { label: "Features", to: "/features" },
  { label: "Pricing", to: "/pricing" },
  { label: "Demo", to: "/demo" },
  { label: "Sports", to: "/sports" },
  { label: "Templates", to: "/templates" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

export function Navbar({ isDark, onToggleDark }: { isDark: boolean; onToggleDark: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text)]">
          <span className="inline-block h-7 w-7 rounded-lg bg-[var(--color-brand)]" />
          TournamentLive
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={onToggleDark}
            aria-label="Toggle dark mode"
            className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)]"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
          <Button to="/login" variant="ghost" size="sm">Log in</Button>
          <Button to="/register" variant="primary" size="sm">Get started</Button>
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          className="rounded-lg p-2 text-[var(--color-text)] lg:hidden"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[var(--color-border)] lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 flex gap-3 px-3">
                <Button to="/login" variant="ghost" size="sm" className="flex-1">Log in</Button>
                <Button to="/register" variant="primary" size="sm" className="flex-1">Get started</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
