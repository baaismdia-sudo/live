import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useSiteContext } from "../../features/publicSite/hooks/useSiteContext";
import { SectionHeading } from "../../features/publicSite/components/FadeInSection";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { Handshake } from "lucide-react";

const TIERS = ["platinum", "gold", "silver", "bronze"];
const TIER_LABEL: Record<string, string> = { platinum: "Platinum Sponsors", gold: "Gold Sponsors", silver: "Silver Sponsors", bronze: "Bronze Sponsors / Partners" };

export default function SponsorsPage() {
  const { tournament } = useSiteContext();
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.from("sponsors").select("*").eq("tournament_id", tournament.id).order("sort_order").then(({ data }) => {
      setSponsors(data ?? []);
      setIsLoading(false);
    });
  }, [tournament.id]);

  if (isLoading) return <PageLoader label="Loading sponsors..." />;
  if (sponsors.length === 0) return <EmptyState icon={Handshake} title="No sponsors yet" />;

  return (
    <div className="space-y-8">
      <SectionHeading title="Sponsors" subtitle="Supporting this tournament" />
      {TIERS.map((tier) => {
        const inTier = sponsors.filter((s) => s.tier === tier);
        if (inTier.length === 0) return null;
        return (
          <div key={tier}>
            <p className="mb-3 font-heading text-sm font-semibold text-[var(--color-heading)]">{TIER_LABEL[tier]}</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {inTier.map((s) => (
                <a key={s.id} href={s.website_url ?? "#"} target="_blank" rel="noreferrer" className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-center transition-shadow hover:shadow-[var(--shadow-md)]">
                  <div className="mx-auto mb-2 flex h-14 w-24 items-center justify-center">
                    {s.logo_url ? <img src={s.logo_url} alt={s.name} className="max-h-14 max-w-24 object-contain" loading="lazy" /> : <span className="text-sm text-[var(--color-muted)]">{s.name}</span>}
                  </div>
                  <p className="text-sm font-medium text-[var(--color-heading)]">{s.name}</p>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
