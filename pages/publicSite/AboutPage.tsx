import { useSiteContext } from "../../features/publicSite/hooks/useSiteContext";
import { SectionHeading } from "../../features/publicSite/components/FadeInSection";

export default function AboutPage() {
  const { tournament } = useSiteContext();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <SectionHeading title={`About ${tournament.name}`} />
      <div className="space-y-4 text-sm leading-relaxed text-[var(--color-text)]">
        <p>{tournament.description || `${tournament.name} is a ${tournament.sport} tournament${tournament.season ? ` for the ${tournament.season} season` : ""}, organized and run on TournamentLive.`}</p>
        {tournament.starts_at && (
          <p>
            The tournament {new Date(tournament.starts_at) > new Date() ? "starts" : "started"} on{" "}
            {new Date(tournament.starts_at).toLocaleDateString()}
            {tournament.ends_at && ` and runs through ${new Date(tournament.ends_at).toLocaleDateString()}`}.
          </p>
        )}
      </div>
      <p className="text-xs text-[var(--color-muted)]">
        Richer About-page content (organizer history, mission, vision as distinct editable fields) is a Website
        Builder content field not yet in the schema — this page currently renders from the tournament's own
        description rather than separate placeholder text.
      </p>
    </div>
  );
}
