import { useSiteContext } from "../../features/publicSite/hooks/useSiteContext";
import { SectionHeading } from "../../features/publicSite/components/FadeInSection";

export function PrivacyPolicyPage() {
  const { tournament } = useSiteContext();
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <SectionHeading title="Privacy Policy" />
      <div className="space-y-3 text-sm leading-relaxed text-[var(--color-text)]">
        <p>{tournament.name} collects only the information you submit directly (such as through the contact form) to respond to your enquiry. We don't sell or share your information with third parties.</p>
        <p>Match data, team rosters, and statistics displayed on this site are provided by the tournament organizer for public viewing.</p>
      </div>
      <p className="text-xs text-[var(--color-muted)]">This is generic boilerplate — a per-tournament editable Privacy Policy is a Website Builder content field not yet in the schema.</p>
    </div>
  );
}

export function TermsPage() {
  const { tournament } = useSiteContext();
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <SectionHeading title="Terms & Conditions" />
      <div className="space-y-3 text-sm leading-relaxed text-[var(--color-text)]">
        <p>By using this website, you agree to follow the rules and conduct expectations set by {tournament.name} organizers.</p>
        <p>All content, including photos and statistics, is provided for informational purposes and may be updated without notice.</p>
      </div>
      <p className="text-xs text-[var(--color-muted)]">Generic boilerplate — same note as the Privacy Policy page above.</p>
    </div>
  );
}
