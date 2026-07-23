import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useSiteContext } from "../../features/publicSite/hooks/useSiteContext";
import { SectionHeading } from "../../features/publicSite/components/FadeInSection";
import { TeamCard } from "../../features/publicSite/components/TeamCard";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { ShieldHalf } from "lucide-react";

export default function TeamsPage() {
  const { tournament } = useSiteContext();
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.from("teams").select("id, name, logo_url, coach_name, manager_name").eq("tournament_id", tournament.id).is("deleted_at", null).eq("status", "approved").order("name").then(({ data }) => {
      setTeams(data ?? []);
      setIsLoading(false);
    });
  }, [tournament.id]);

  return (
    <div>
      <SectionHeading title="Teams" subtitle={`${teams.length} teams competing`} />
      {isLoading ? <PageLoader label="Loading teams..." /> : teams.length === 0 ? <EmptyState icon={ShieldHalf} title="No teams yet" /> : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{teams.map((t, i) => <TeamCard key={t.id} team={t} slug={tournament.slug} index={i} />)}</div>
      )}
    </div>
  );
}
