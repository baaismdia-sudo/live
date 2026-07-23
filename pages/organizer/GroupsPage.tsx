import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { AdminDataTable, type Column } from "../../features/admin/components/AdminDataTable";
import { Drawer } from "../../features/admin/components/Drawer";
import { TextField, SelectField } from "../../features/admin/components/FormField";
import { TournamentSelector } from "../../features/organizer/components/TournamentSelector";
import { useOrganizerTournaments } from "../../features/organizer/hooks/useOrganizerTournaments";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { Layers } from "lucide-react";

interface Group { id: string; name: string; sort_order: number }
interface TeamOption { id: string; name: string; group_id: string | null }

export default function GroupsPage() {
  const { tournaments, selectedId, setSelectedId, isLoading: tournamentsLoading } = useOrganizerTournaments();
  const [groups, setGroups] = useState<Group[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    if (!selectedId) return;
    setIsLoading(true);
    const [groupsRes, teamsRes] = await Promise.all([
      supabase.from("groups").select("*").eq("tournament_id", selectedId).order("sort_order"),
      supabase.from("teams").select("id, name, group_id").eq("tournament_id", selectedId).is("deleted_at", null),
    ]);
    if (groupsRes.error) setError(groupsRes.error.message);
    setGroups((groupsRes.data ?? []) as Group[]);
    setTeams((teamsRes.data ?? []) as TeamOption[]);
    setIsLoading(false);
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const addGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await supabase.from("groups").insert({ tournament_id: selectedId, name: groupName, sort_order: groups.length + 1 });
      setDrawerOpen(false);
      setGroupName("");
      load();
    } finally {
      setIsSaving(false);
    }
  };

  const removeGroup = async (g: Group) => { await supabase.from("groups").delete().eq("id", g.id); load(); };

  const assignTeam = async (teamId: string, groupId: string) => {
    await supabase.from("teams").update({ group_id: groupId || null }).eq("id", teamId);
    load();
  };

  const columns: Column<Group>[] = [
    { header: "Group", render: (g) => <span className="font-medium text-[var(--color-heading)]">{g.name}</span> },
    { header: "Teams", render: (g) => teams.filter((t) => t.group_id === g.id).length },
  ];

  if (tournamentsLoading) return null;
  if (tournaments.length === 0) return <EmptyState icon={Layers} title="Create a tournament first" />;

  return (
    <>
      <title>Groups · TournamentLive</title>
      <div className="px-6 pt-6"><TournamentSelector tournaments={tournaments} selectedId={selectedId} onChange={setSelectedId} /></div>
      <AdminDataTable title="Groups" description="Create unlimited groups and assign teams to each." columns={columns} rows={groups} isLoading={isLoading} error={error} search="" onSearchChange={() => {}} onCreate={() => setDrawerOpen(true)} onDelete={removeGroup} page={1} totalPages={1} onPageChange={() => {}} emptyLabel="No groups yet" />

      {groups.length > 0 && teams.length > 0 && (
        <div className="mx-6 mb-6 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="mb-3 font-heading text-sm font-semibold text-[var(--color-heading)]">Assign teams to groups</h2>
          <div className="space-y-2">
            {teams.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] py-2 last:border-0">
                <span className="text-sm text-[var(--color-text)]">{t.name}</span>
                <select
                  value={t.group_id ?? ""}
                  onChange={(e) => assignTeam(t.id, e.target.value)}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="">Unassigned</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="New group">
        <form onSubmit={addGroup} className="space-y-4">
          <TextField label="Group name (e.g. Group A)" value={groupName} onChange={setGroupName} />
          <button type="submit" disabled={isSaving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
            {isSaving && <ButtonSpinner />}
            Add group
          </button>
        </form>
      </Drawer>
    </>
  );
}
