import { Construction } from "lucide-react";
import { useLocation } from "react-router-dom";
import { SIDEBAR_GROUPS } from "../../features/admin/data/sidebar";
import { ORGANIZER_SIDEBAR_GROUPS } from "../../features/organizer/data/sidebar";

/**
 * Honest placeholder for sidebar destinations scoped but not yet built to
 * full depth — see the relevant prompt's delivery summary for the full list
 * and why. This routes correctly and says so plainly, rather than 404ing or
 * faking a working screen.
 */
export default function ComingSoonPage() {
  const location = useLocation();
  const allItems = [...SIDEBAR_GROUPS, ...ORGANIZER_SIDEBAR_GROUPS].flatMap((g) => g.items);
  const match = allItems.find((item) => item.to === location.pathname);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <title>{`${match?.label ?? "Coming soon"} · TournamentLive Admin`}</title>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
        <Construction size={24} />
      </div>
      <div>
        <h1 className="font-heading text-lg font-semibold text-[var(--color-heading)]">
          {match?.label ?? "This module"} is scoped, not yet built
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
          This is a genuine multi-step feature (schema, RLS, and UI) that deserves its own dedicated build pass
          rather than a shallow version. Ask to continue with it by name and it'll be built with the same
          real-CRUD standard as Rental Plans, Sports, and Coupons.
        </p>
      </div>
    </div>
  );
}
