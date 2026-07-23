import { useEffect, useState } from "react";
import { Copy, ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { TournamentSelector } from "../../features/organizer/components/TournamentSelector";
import { useOrganizerTournaments } from "../../features/organizer/hooks/useOrganizerTournaments";
import { TextField } from "../../features/admin/components/FormField";
import { PageLoader, ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { Link2 } from "lucide-react";

interface CustomDomain {
  id: string;
  domain_name: string;
  verification_status: "pending" | "verified" | "failed";
  verification_token: string;
  ssl_status: string;
}

export default function CustomDomainPage() {
  const { tournaments, selectedId, setSelectedId, isLoading: tournamentsLoading } = useOrganizerTournaments();
  const [domain, setDomain] = useState<CustomDomain | null>(null);
  const [subdomain, setSubdomain] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    if (!selectedId) return;
    setIsLoading(true);
    const [domainRes, subRes] = await Promise.all([
      supabase.from("custom_domains").select("*").eq("tournament_id", selectedId).maybeSingle(),
      supabase.from("domains").select("subdomain").eq("tournament_id", selectedId).maybeSingle(),
    ]);
    setDomain(domainRes.data as CustomDomain | null);
    setSubdomain(subRes.data?.subdomain ?? "");
    setIsLoading(false);
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const connect = async () => {
    if (!newDomain.trim()) return;
    setIsSaving(true);
    try {
      const { data } = await supabase.from("custom_domains").insert({ tournament_id: selectedId, domain_name: newDomain.trim() }).select().single();
      setDomain(data as CustomDomain);
      setNewDomain("");
    } finally {
      setIsSaving(false);
    }
  };

  const disconnect = async () => {
    if (!domain) return;
    await supabase.from("custom_domains").delete().eq("id", domain.id);
    setDomain(null);
  };

  if (tournamentsLoading) return null;
  if (tournaments.length === 0) return <EmptyState icon={Link2} title="Create a tournament first" />;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <title>Custom Domain · TournamentLive</title>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--color-heading)]">Custom Domain</h1>
          <p className="text-sm text-[var(--color-muted)]">Connect your own domain to your tournament site.</p>
        </div>
        <TournamentSelector tournaments={tournaments} selectedId={selectedId} onChange={setSelectedId} />
      </div>

      {isLoading ? (
        <PageLoader label="Loading domain settings..." />
      ) : (
        <>
          <section className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="font-heading text-sm font-semibold text-[var(--color-heading)]">Free subdomain</h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-[var(--color-text)]">
              {subdomain ? `${subdomain}.tournamentlive.app` : "Not set"}
              {subdomain && (
                <button onClick={() => navigator.clipboard.writeText(`https://${subdomain}.tournamentlive.app`)} aria-label="Copy link" className="text-[var(--color-muted)] hover:text-[var(--color-primary)]">
                  <Copy size={14} />
                </button>
              )}
            </p>
          </section>

          <section className="space-y-4 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="font-heading text-sm font-semibold text-[var(--color-heading)]">Custom domain</h2>
            {domain ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[var(--color-heading)]">{domain.domain_name}</p>
                  <button onClick={disconnect} className="text-sm font-medium text-[var(--color-danger)] hover:underline">Disconnect</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <StatusPill
                    icon={domain.verification_status === "verified" ? ShieldCheck : domain.verification_status === "failed" ? ShieldAlert : Clock}
                    label={`DNS: ${domain.verification_status}`}
                    tone={domain.verification_status === "verified" ? "success" : domain.verification_status === "failed" ? "danger" : "warning"}
                  />
                  <StatusPill icon={ShieldCheck} label={`SSL: ${domain.ssl_status}`} tone={domain.ssl_status === "active" ? "success" : "warning"} />
                </div>
                <div className="rounded-lg bg-[var(--color-surface-secondary)] p-4 text-xs">
                  <p className="mb-2 font-medium text-[var(--color-heading)]">DNS instructions</p>
                  <p className="text-[var(--color-muted)]">Add a CNAME record pointing your domain to <code>sites.tournamentlive.app</code>, then add this TXT record to verify ownership:</p>
                  <code className="mt-2 block break-all rounded bg-[var(--color-surface)] p-2">{domain.verification_token}</code>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="flex-1">
                  <TextField label="Domain name" value={newDomain} onChange={setNewDomain} />
                </div>
                <div className="flex items-end">
                  <button onClick={connect} disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
                    {isSaving && <ButtonSpinner />}
                    Connect
                  </button>
                </div>
              </div>
            )}
            <p className="text-xs text-[var(--color-muted)]">
              Verification and SSL provisioning normally happen via a scheduled Edge Function that checks DNS
              records and calls Vercel's domain API — that automation is queued as a follow-up; this screen
              reflects the real `custom_domains` record and the DNS instructions to give it manually for now.
            </p>
          </section>
        </>
      )}
    </div>
  );
}

function StatusPill({ icon: Icon, label, tone }: { icon: typeof ShieldCheck; label: string; tone: "success" | "warning" | "danger" }) {
  const tones = {
    success: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    warning: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
    danger: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  };
  return (
    <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}>
      <Icon size={13} /> {label}
    </span>
  );
}
