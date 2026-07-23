import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useSiteContext } from "../../features/publicSite/hooks/useSiteContext";
import { SectionHeading } from "../../features/publicSite/components/FadeInSection";
import { MatchCard } from "../../features/publicSite/components/MatchCard";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { ExportMenu } from "../../features/shared/components/ExportMenu";
import { ListChecks } from "lucide-react";

export default function ResultsPage() {
  const { tournament } = useSiteContext();
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("matches")
      .select("id, status, ended_at, home_score, away_score, home:teams!matches_home_team_id_fkey(name, logo_url), away:teams!matches_away_team_id_fkey(name, logo_url)")
      .eq("tournament_id", tournament.id)
      .eq("status", "completed")
      .order("ended_at", { ascending: false })
      .then(({ data }) => {
        setMatches(data ?? []);
        setIsLoading(false);
      });
  }, [tournament.id]);

  return (
    <div>
      <SectionHeading
        title="Results"
        subtitle="Completed matches"
        action={<ExportMenu rows={matches.map((m) => ({ home: m.home?.name, away: m.away?.name, score: `${m.home_score}-${m.away_score}`, date: m.ended_at }))} filenameBase="results" pdfTitle={`${tournament.name} Results`} />}
      />
      {isLoading ? (
        <PageLoader label="Loading results..." />
      ) : matches.length === 0 ? (
        <EmptyState icon={ListChecks} title="No results yet" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">{matches.map((m) => <MatchCard key={m.id} match={m} />)}</div>
      )}
    </div>
  );
}
