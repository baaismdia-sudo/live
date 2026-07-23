import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { AdminDataTable, type Column } from "../../features/admin/components/AdminDataTable";
import { Drawer } from "../../features/admin/components/Drawer";
import { TextField, SelectField, TextAreaField } from "../../features/admin/components/FormField";
import { TournamentSelector } from "../../features/organizer/components/TournamentSelector";
import { useOrganizerTournaments } from "../../features/organizer/hooks/useOrganizerTournaments";
import { ExportMenu } from "../../features/shared/components/ExportMenu";
import { QrCodeButton } from "../../features/shared/components/QrCodeButton";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { ShieldHalf, Copy } from "lucide-react";

interface Team {
  id: string;
  name: string;
  short_name: string | null;
  slug: string;
  logo_url: string | null;
  manager_name: string | null;
  coach_name: string | null;
  contact_email: string | null;
  status: "pending" | "approved" | "rejected";
  primary_color: string | null;
  secondary_color: string | null;
  description: string | null;
  home_ground: string | null;
  founded_year: number | null;
  website_url: string | null;
  captain_player_id: string | null;
  vice_captain_player_id: string | null;
}
interface PlayerOption { id: string; full_name: string }

const emptyForm = {
  name: "", short_name: "", slug: "", logo_url: "", manager_name: "", coach_name: "", contact_email: "",
  status: "pending", primary_color: "#4F46E5", secondary_color: "#7C3AED", description: "", home_ground: "",
  founded_year: "", website_url: "", captain_player_id: "", vice_captain_player_id: "",
};
const PAGE_SIZE = 15;

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function TeamsPage() {
  const { tournaments, selectedId, setSelectedId, isLoading: tournamentsLoading } = useOrganizerTournaments();
  const [rows, setRows] = useState<Team[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rosterPlayers, setRosterPlayers] = useState<PlayerOption[]>([]);

  const load = async () => {
    if (!selectedId) return;
    setIsLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = supabase.from("teams").select("*", { count: "exact" }).eq("tournament_id", selectedId).is("deleted_at", null).order("created_at", { ascending: false }).range(from, to);
    if (search) query = query.ilike("name", `%${search}%`);
    const { data, error: fetchError, count } = await query;
    if (fetchError) setError(fetchError.message);
    else {
      setRows((data ?? []) as Team[]);
      setTotal(count ?? 0);
    }
    setIsLoading(false);
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, page, search]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setRosterPlayers([]); setDrawerOpen(true); };
  const openEdit = async (team: Team) => {
    setEditing(team);
    setForm({
      name: team.name, short_name: team.short_name ?? "", slug: team.slug, logo_url: team.logo_url ?? "",
      manager_name: team.manager_name ?? "", coach_name: team.coach_name ?? "", contact_email: team.contact_email ?? "",
      status: team.status, primary_color: team.primary_color ?? "#4F46E5", secondary_color: team.secondary_color ?? "#7C3AED",
      description: team.description ?? "", home_ground: team.home_ground ?? "", founded_year: team.founded_year?.toString() ?? "",
      website_url: team.website_url ?? "", captain_player_id: team.captain_player_id ?? "", vice_captain_player_id: team.vice_captain_player_id ?? "",
    });
    const { data } = await supabase.from("players").select("id, full_name").eq("team_id", team.id).is("deleted_at", null);
    setRosterPlayers(data ?? []);
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);
    try {
      const values = {
        ...form,
        slug: form.slug || slugify(form.name),
        tournament_id: selectedId,
        founded_year: form.founded_year ? Number(form.founded_year) : null,
        captain_player_id: form.captain_player_id || null,
        vice_captain_player_id: form.vice_captain_player_id || null,
      };
      if (editing) {
        const { error: updateError } = await supabase.from("teams").update(values).eq("id", editing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("teams").insert(values);
        if (insertError) throw insertError;
      }
      setDrawerOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save team");
    } finally {
      setIsSaving(false);
    }
  };

  const archive = async (team: Team) => { await supabase.from("teams").update({ deleted_at: new Date().toISOString() }).eq("id", team.id); load(); };
  const duplicate = async (team: Team) => {
    await supabase.from("teams").insert({
      tournament_id: selectedId, name: `${team.name} (Copy)`, slug: `${team.slug}-copy-${Date.now()}`,
      logo_url: team.logo_url, manager_name: team.manager_name, coach_name: team.coach_name,
      primary_color: team.primary_color, secondary_color: team.secondary_color, status: "pending",
    });
    load();
  };

  const columns: Column<Team>[] = [
    {
      header: "Team",
      render: (t) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[var(--color-surface-secondary)]">
            {t.logo_url ? <img src={t.logo_url} alt="" className="h-full w-full object-cover" /> : <ShieldHalf size={14} className="text-[var(--color-muted)]" />}
          </div>
          <span className="font-medium text-[var(--color-heading)]">{t.name}</span>
        </div>
      ),
    },
    { header: "Manager / Coach", render: (t) => [t.manager_name, t.coach_name].filter(Boolean).join(" / ") || "—" },
    { header: "Home ground", render: (t) => t.home_ground ?? "—" },
    { header: "Status", render: (t) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${t.status === "approved" ? "bg-[var(--color-success)]/10 text-[var(--color-success)]" : t.status === "rejected" ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)]" : "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"}`}>{t.status}</span> },
    { header: "Duplicate", render: (t) => <button onClick={() => duplicate(t)} className="text-[var(--color-muted)] hover:text-[var(--color-primary)]" aria-label="Duplicate team"><Copy size={15} /></button> },
    { header: "QR", render: (t) => <QrCodeButton value={`https://tournamentlive.app/teams/${t.id}`} label={t.name} /> },
  ];

  if (tournamentsLoading) return null;
  if (tournaments.length === 0) return <EmptyState icon={ShieldHalf} title="Create a tournament first" description="Teams belong to a tournament — create one to start adding teams." />;

  return (
    <>
      <title>Teams · TournamentLive</title>
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6">
        <TournamentSelector tournaments={tournaments} selectedId={selectedId} onChange={(id) => { setPage(1); setSelectedId(id); }} />
        <ExportMenu rows={rows.map((t) => ({ name: t.name, short_name: t.short_name, manager: t.manager_name, coach: t.coach_name, status: t.status, home_ground: t.home_ground, founded_year: t.founded_year }))} filenameBase="teams-export" pdfTitle="Teams" />
      </div>
      <AdminDataTable title="Teams" description="Teams registered for the selected tournament." columns={columns} rows={rows} isLoading={isLoading} error={error} search={search} onSearchChange={(v) => { setPage(1); setSearch(v); }} onCreate={openCreate} onEdit={openEdit} onDelete={archive} page={page} totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))} onPageChange={setPage} emptyLabel="No teams yet" />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Edit team" : "New team"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)] dark:bg-red-900/20">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Team name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
            <TextField label="Short name" value={form.short_name} onChange={(v) => setForm((f) => ({ ...f, short_name: v }))} />
          </div>
          <TextField label="Slug" value={form.slug} onChange={(v) => setForm((f) => ({ ...f, slug: v }))} />
          <TextField label="Logo URL" value={form.logo_url} onChange={(v) => setForm((f) => ({ ...f, logo_url: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Coach name" value={form.coach_name} onChange={(v) => setForm((f) => ({ ...f, coach_name: v }))} />
            <TextField label="Manager name" value={form.manager_name} onChange={(v) => setForm((f) => ({ ...f, manager_name: v }))} />
          </div>
          {editing && rosterPlayers.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Captain" value={form.captain_player_id} onChange={(v) => setForm((f) => ({ ...f, captain_player_id: v }))} options={[{ value: "", label: "—" }, ...rosterPlayers.map((p) => ({ value: p.id, label: p.full_name }))]} />
              <SelectField label="Vice captain" value={form.vice_captain_player_id} onChange={(v) => setForm((f) => ({ ...f, vice_captain_player_id: v }))} options={[{ value: "", label: "—" }, ...rosterPlayers.map((p) => ({ value: p.id, label: p.full_name }))]} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Primary color</label>
              <input type="color" value={form.primary_color} onChange={(e) => setForm((f) => ({ ...f, primary_color: e.target.value }))} className="h-10 w-full rounded-lg border border-[var(--color-border)]" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Secondary color</label>
              <input type="color" value={form.secondary_color} onChange={(e) => setForm((f) => ({ ...f, secondary_color: e.target.value }))} className="h-10 w-full rounded-lg border border-[var(--color-border)]" />
            </div>
          </div>
          <TextAreaField label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Home ground" value={form.home_ground} onChange={(v) => setForm((f) => ({ ...f, home_ground: v }))} />
            <TextField label="Founded year" type="number" value={form.founded_year} onChange={(v) => setForm((f) => ({ ...f, founded_year: v }))} />
          </div>
          <TextField label="Website" value={form.website_url} onChange={(v) => setForm((f) => ({ ...f, website_url: v }))} />
          <TextField label="Contact email" value={form.contact_email} onChange={(v) => setForm((f) => ({ ...f, contact_email: v }))} />
          <SelectField label="Status" value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} options={[{ value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "rejected", label: "Rejected" }]} />
          <button type="submit" disabled={isSaving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
            {isSaving && <ButtonSpinner />}
            {editing ? "Save changes" : "Add team"}
          </button>
        </form>
      </Drawer>
    </>
  );
}
