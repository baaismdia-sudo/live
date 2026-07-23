import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * Copy is hardcoded here as a fallback default; the Super Admin dashboard
 * (Prompt 5) writes to system_settings.key = 'announcement_bar' and this
 * component should be swapped to read from there once that table has real
 * content — flagged rather than left silently static.
 */
export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="relative flex items-center justify-center gap-2 bg-[var(--color-brand)] px-4 py-2 text-center text-sm text-white">
      <span>🎉 New: Create tournament websites in minutes.</span>
      <Link to="/register" className="font-semibold underline underline-offset-2">
        Start free
      </Link>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
