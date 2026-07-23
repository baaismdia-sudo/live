import { useEffect, useState } from "react";
import { Flag } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { ErrorState } from "../../components/ui/ErrorState";

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  is_enabled: boolean;
  rollout_percentage: number;
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    const { data, error: fetchError } = await supabase.from("feature_flags").select("*").order("name");
    if (fetchError) setError(fetchError.message);
    else setFlags(data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (flag: FeatureFlag) => {
    setFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, is_enabled: !f.is_enabled } : f)));
    const { error: updateError } = await supabase.from("feature_flags").update({ is_enabled: !flag.is_enabled }).eq("id", flag.id);
    if (updateError) load();
  };

  const updateRollout = async (flag: FeatureFlag, percentage: number) => {
    setFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, rollout_percentage: percentage } : f)));
    await supabase.from("feature_flags").update({ rollout_percentage: percentage }).eq("id", flag.id);
  };

  if (isLoading) return <PageLoader label="Loading feature flags..." />;
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={load} /></div>;

  return (
    <div className="space-y-5 p-6">
      <title>Feature Flags · TournamentLive Admin</title>
      <div>
        <h1 className="font-heading text-xl font-bold text-[var(--color-heading)]">Feature Flags</h1>
        <p className="text-sm text-[var(--color-muted)]">Turn platform-wide features on or off without a deploy.</p>
      </div>

      <div className="divide-y divide-[var(--color-border)] rounded-card border border-[var(--color-border)] bg-[var(--color-surface)]">
        {flags.map((flag) => (
          <div key={flag.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <Flag size={16} />
              </div>
              <div>
                <p className="font-medium text-[var(--color-heading)]">{flag.name}</p>
                <p className="text-xs text-[var(--color-muted)]">{flag.description}</p>
                <code className="text-[10px] text-[var(--color-muted)]">{flag.key}</code>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {flag.is_enabled && (
                <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={flag.rollout_percentage}
                    onChange={(e) => updateRollout(flag, Number(e.target.value))}
                    className="w-24 accent-[var(--color-primary)]"
                  />
                  {flag.rollout_percentage}%
                </div>
              )}
              <button
                role="switch"
                aria-checked={flag.is_enabled}
                onClick={() => toggle(flag)}
                className={`relative h-6 w-11 rounded-full transition-colors ${flag.is_enabled ? "bg-[var(--color-success)]" : "bg-[var(--color-border)]"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${flag.is_enabled ? "translate-x-[22px]" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
