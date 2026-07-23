import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useSiteContext } from "../../features/publicSite/hooks/useSiteContext";
import { SectionHeading } from "../../features/publicSite/components/FadeInSection";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { BarChart2 } from "lucide-react";

export default function PointsTablePage() {
  const { tournament } = useSiteContext();
  const [rows, setRows] = useState<any[]>([]);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [groupFilter, setGroupFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.from("standings").select("*, teams(name, logo_url)").eq("tournament_id", tournament.id).order("rank", { ascending: true, nullsFirst: false }).then(({ data }) => {
      setRows(data ?? []);
      setIsLoading(false);
    });
    supabase.from("groups").select("id, name").eq("tournament_id", tournament.id).then(({ data }) => setGroups(data ?? []));
  }, [tournament.id]);

  const filtered = groupFilter ? rows.filter((r) => r.group_id === groupFilter) : rows;

  return (
    <div>
      <SectionHeading title="Points Table" />
      {groups.length > 0 && (
        <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className="mb-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]">
          <option value="">All groups</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      )}
      {isLoading ? (
        <PageLoader label="Loading standings..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={BarChart2} title="No standings yet" />
      ) : (
        <div className="overflow-x-auto rounded-card border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-surface-secondary)] text-xs uppercase text-[var(--color-muted)]">
              <tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Team</th><th className="px-4 py-3">P</th><th className="px-4 py-3">W</th><th className="px-4 py-3">D</th><th className="px-4 py-3">L</th><th className="px-4 py-3">GD</th><th className="px-4 py-3">Pts</th></tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-[var(--color-heading)]">{r.rank ?? "—"}</td>
                  <td className="px-4 py-3 font-medium text-[var(--color-heading)]">{r.teams?.name}</td>
                  <td className="px-4 py-3">{r.played}</td><td className="px-4 py-3">{r.won}</td><td className="px-4 py-3">{r.drawn}</td><td className="px-4 py-3">{r.lost}</td>
                  <td className="px-4 py-3">{r.goal_difference}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--color-primary)]">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-[var(--color-muted)]">Net Run Rate and Win % need sport-specific data not yet captured — flagged rather than approximated.</p>
    </div>
  );
}
