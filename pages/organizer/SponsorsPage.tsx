import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { AdminDataTable, type Column } from "../../features/admin/components/AdminDataTable";
import { Drawer } from "../../features/admin/components/Drawer";
import { TextField, SelectField } from "../../features/admin/components/FormField";
import { TournamentSelector } from "../../features/organizer/components/TournamentSelector";
import { useOrganizerTournaments } from "../../features/organizer/hooks/useOrganizerTournaments";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { Handshake } from "lucide-react";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  tier: string;
}
const emptyForm = { name: "", logo_url: "", website_url: "", tier: "bronze" };

export default function SponsorsPage() {
  const { tournaments, selectedId, setSelectedId, isLoading: tournamentsLoading } = useOrganizerTournaments();
  const [rows, setRows] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    if (!selectedId) return;
    setIsLoading(true);
    const { data, error: fetchError } = await supabase.from("sponsors").select("*").eq("tournament_id", selectedId).order("sort_order");
    if (fetchError) setError(fetchError.message);
    else setRows((data ?? []) as Sponsor[]);
    setIsLoading(false);
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDrawerOpen(true); };
  const openEdit = (s: Sponsor) => { setEditing(s); setForm({ name: s.name, logo_url: s.logo_url ?? "", website_url: s.website_url ?? "", tier: s.tier }); setDrawerOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const values = { ...form, tournament_id: selectedId };
      if (editing) await supabase.from("sponsors").update(values).eq("id", editing.id);
      else await supabase.from("sponsors").insert(values);
      setDrawerOpen(false);
      load();
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (s: Sponsor) => { await supabase.from("sponsors").delete().eq("id", s.id); load(); };

  const columns: Column<Sponsor>[] = [
    { header: "Sponsor", render: (s) => <span className="font-medium text-[var(--color-heading)]">{s.name}</span> },
    { header: "Tier", render: (s) => <span className="capitalize">{s.tier}</span> },
    { header: "Website", render: (s) => s.website_url ? <a href={s.website_url} target="_blank" rel="noreferrer" className="text-[var(--color-primary)] hover:underline">{s.website_url}</a> : "—" },
  ];

  if (tournamentsLoading) return null;
  if (tournaments.length === 0) return <EmptyState icon={Handshake} title="Create a tournament first" />;

  return (
    <>
      <title>Sponsors · TournamentLive</title>
      <div className="px-6 pt-6"><TournamentSelector tournaments={tournaments} selectedId={selectedId} onChange={setSelectedId} /></div>
      <AdminDataTable title="Sponsors" description="Sponsors shown on your tournament's public website." columns={columns} rows={rows} isLoading={isLoading} error={error} search="" onSearchChange={() => {}} onCreate={openCreate} onEdit={openEdit} onDelete={remove} page={1} totalPages={1} onPageChange={() => {}} emptyLabel="No sponsors yet" />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Edit sponsor" : "New sponsor"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
          <TextField label="Logo URL" value={form.logo_url} onChange={(v) => setForm((f) => ({ ...f, logo_url: v }))} />
          <TextField label="Website URL" value={form.website_url} onChange={(v) => setForm((f) => ({ ...f, website_url: v }))} />
          <SelectField label="Tier" value={form.tier} onChange={(v) => setForm((f) => ({ ...f, tier: v }))} options={[{ value: "platinum", label: "Platinum" }, { value: "gold", label: "Gold" }, { value: "silver", label: "Silver" }, { value: "bronze", label: "Bronze" }]} />
          <button type="submit" disabled={isSaving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
            {isSaving && <ButtonSpinner />}
            {editing ? "Save changes" : "Add sponsor"}
          </button>
        </form>
      </Drawer>
    </>
  );
}
