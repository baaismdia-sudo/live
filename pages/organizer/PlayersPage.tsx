import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Upload, User } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { AdminDataTable, type Column } from "../../features/admin/components/AdminDataTable";
import { Drawer } from "../../features/admin/components/Drawer";
import { TextField, SelectField, TextAreaField, CheckboxField } from "../../features/admin/components/FormField";
import { TournamentSelector } from "../../features/organizer/components/TournamentSelector";
import { useOrganizerTournaments } from "../../features/organizer/hooks/useOrganizerTournaments";
import { ExportMenu } from "../../features/shared/components/ExportMenu";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";

interface Player {
  id: string;
  team_id: string;
  full_name: string;
  nickname: string | null;
  jersey_number: number | null;
  position: string | null;
  role: string | null;
  photo_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  nationality: string | null;
  city: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  email: string | null;
  phone: string | null;
  is_captain: boolean;
  is_vice_captain: boolean;
  status: string;
}

interface TeamOption {
  id: string;
  name: string;
}

const emptyForm = {
  full_name: "", nickname: "", jersey_number: "", position: "", role: "", photo_url: "", date_of_birth: "",
  gender: "", nationality: "", city: "", height_cm: "", weight_kg: "", email: "", phone: "",
  is_captain: false, is_vice_captain: false, medical_notes: "", emergency_contact_name: "", emergency_contact_phone: "",
};
const PAGE_SIZE = 15;

export default function PlayersPage() {
  const { tournaments, selectedId, setSelectedId, isLoading: tournamentsLoading } = useOrganizerTournaments();
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [rows, setRows] = useState<Player[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedId) return;
    supabase.from("teams").select("id, name").eq("tournament_id", selectedId).is("deleted_at", null).then(({ data }) => {
      setTeams(data ?? []);
      setSelectedTeamId(data && data.length > 0 ? data[0].id : "");
    });
  }, [selectedId]);

  const load = async () => {
    if (!selectedTeamId) {
      setRows([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = supabase.from("players").select("*", { count: "exact" }).eq("team_id", selectedTeamId).is("deleted_at", null).order("jersey_number").range(from, to);
    if (search) query = query.ilike("full_name", `%${search}%`);
    const { data, error: fetchError, count } = await query;
    if (fetchError) setError(fetchError.message);
    else {
      setRows((data ?? []) as Player[]);
      setTotal(count ?? 0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeamId, page, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };
  const openEdit = async (p: Player) => {
    setEditing(p);
    const { data: medicalRow } = await supabase.from("player_medical_notes").select("notes").eq("player_id", p.id).maybeSingle();
    const { data: fullRow } = await supabase.from("players").select("emergency_contact_name, emergency_contact_phone").eq("id", p.id).single();
    setForm({
      full_name: p.full_name, nickname: p.nickname ?? "", jersey_number: p.jersey_number?.toString() ?? "", position: p.position ?? "",
      role: p.role ?? "", photo_url: p.photo_url ?? "", date_of_birth: p.date_of_birth ?? "", gender: p.gender ?? "",
      nationality: p.nationality ?? "", city: p.city ?? "", height_cm: p.height_cm?.toString() ?? "", weight_kg: p.weight_kg?.toString() ?? "",
      email: p.email ?? "", phone: p.phone ?? "", is_captain: p.is_captain, is_vice_captain: p.is_vice_captain,
      medical_notes: medicalRow?.notes ?? "", emergency_contact_name: fullRow?.emergency_contact_name ?? "", emergency_contact_phone: fullRow?.emergency_contact_phone ?? "",
    });
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);
    try {
      const values = {
        team_id: selectedTeamId,
        full_name: form.full_name,
        nickname: form.nickname || null,
        jersey_number: form.jersey_number ? Number(form.jersey_number) : null,
        position: form.position || null,
        role: form.role || null,
        photo_url: form.photo_url || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        nationality: form.nationality || null,
        city: form.city || null,
        height_cm: form.height_cm ? Number(form.height_cm) : null,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
        email: form.email || null,
        phone: form.phone || null,
        is_captain: form.is_captain,
        is_vice_captain: form.is_vice_captain,
        emergency_contact_name: form.emergency_contact_name || null,
        emergency_contact_phone: form.emergency_contact_phone || null,
      };
      let playerId = editing?.id;
      if (editing) {
        const { error: updateError } = await supabase.from("players").update(values).eq("id", editing.id);
        if (updateError) throw updateError;
      } else {
        const { data: inserted, error: insertError } = await supabase.from("players").insert(values).select().single();
        if (insertError) throw insertError;
        playerId = inserted.id;
      }
      if (playerId && form.medical_notes.trim()) {
        await supabase
          .from("player_medical_notes")
          .upsert({ player_id: playerId, notes: form.medical_notes.trim() }, { onConflict: "player_id" });
      }
      setDrawerOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save player");
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (p: Player) => {
    await supabase.from("players").update({ deleted_at: new Date().toISOString() }).eq("id", p.id);
    load();
  };

  const importCsv = async (file: File) => {
    const text = await file.text();
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());
    const records = lines.slice(1).map((line) => {
      const values = line.split(",");
      const record: Record<string, string> = {};
      headers.forEach((h, i) => (record[h] = (values[i] ?? "").replace(/^"|"$/g, "")));
      return record;
    });

    const inserts = records
      .filter((r) => r.full_name)
      .map((r) => ({
        team_id: selectedTeamId,
        full_name: r.full_name,
        jersey_number: r.jersey_number ? Number(r.jersey_number) : null,
        position: r.position || null,
        date_of_birth: r.date_of_birth || null,
        gender: r.gender || null,
        nationality: r.nationality || null,
        is_captain: r.is_captain === "true",
      }));

    if (inserts.length > 0) {
      await supabase.from("players").insert(inserts);
      load();
    }
  };

  const columns: Column<Player>[] = [
    {
      header: "Player",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-secondary)]">
            {p.photo_url ? <img src={p.photo_url} alt="" className="h-full w-full object-cover" /> : <User size={14} className="text-[var(--color-muted)]" />}
          </div>
          <Link to={`/dashboard/players/${p.id}`} className="font-medium text-[var(--color-heading)] hover:text-[var(--color-primary)]">{p.full_name}</Link>
          {p.is_captain && <span className="rounded bg-[var(--color-accent)]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-accent)]">C</span>}
          {p.is_vice_captain && <span className="rounded bg-[var(--color-secondary)]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-secondary)]">VC</span>}
        </div>
      ),
    },
    { header: "#", render: (p) => p.jersey_number ?? "—" },
    { header: "Position / Role", render: (p) => [p.position, p.role].filter(Boolean).join(" · ") || "—" },
    { header: "Nationality", render: (p) => p.nationality ?? "—" },
  ];

  if (tournamentsLoading) return null;
  if (tournaments.length === 0) {
    return <EmptyState icon={User} title="Create a tournament first" />;
  }

  return (
    <>
      <title>Players · TournamentLive</title>
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6">
        <div className="flex gap-2">
          <TournamentSelector tournaments={tournaments} selectedId={selectedId} onChange={(id) => { setPage(1); setSelectedId(id); }} />
          {teams.length > 0 && (
            <select
              value={selectedTeamId}
              onChange={(e) => { setPage(1); setSelectedTeamId(e.target.value); }}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            >
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}
        </div>
        <div className="flex gap-2">
          <ExportMenu rows={rows.map((p) => ({ full_name: p.full_name, nickname: p.nickname, jersey_number: p.jersey_number, position: p.position, role: p.role, nationality: p.nationality, city: p.city, height_cm: p.height_cm, weight_kg: p.weight_kg }))} filenameBase="players-export" pdfTitle="Players" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium hover:bg-[var(--color-surface-secondary)]">
            <Upload size={15} /> Import CSV
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])} />
        </div>
      </div>

      {teams.length === 0 ? (
        <EmptyState icon={User} title="Add a team first" description="Players belong to a team — create one in Teams." />
      ) : (
        <AdminDataTable
          title="Players"
          description="Roster for the selected team."
          columns={columns}
          rows={rows}
          isLoading={isLoading}
          error={error}
          search={search}
          onSearchChange={(v) => { setPage(1); setSearch(v); }}
          onCreate={openCreate}
          onEdit={openEdit}
          onDelete={remove}
          page={page}
          totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
          onPageChange={setPage}
          emptyLabel="No players yet"
        />
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Edit player" : "New player"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)] dark:bg-red-900/20">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Full name" value={form.full_name} onChange={(v) => setForm((f) => ({ ...f, full_name: v }))} />
            <TextField label="Nickname" value={form.nickname} onChange={(v) => setForm((f) => ({ ...f, nickname: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Jersey number" type="number" value={form.jersey_number} onChange={(v) => setForm((f) => ({ ...f, jersey_number: v }))} />
            <TextField label="Position" value={form.position} onChange={(v) => setForm((f) => ({ ...f, position: v }))} />
          </div>
          <TextField label="Role (e.g. All-rounder, Striker)" value={form.role} onChange={(v) => setForm((f) => ({ ...f, role: v }))} />
          <TextField label="Photo URL" value={form.photo_url} onChange={(v) => setForm((f) => ({ ...f, photo_url: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Date of birth" type="date" value={form.date_of_birth} onChange={(v) => setForm((f) => ({ ...f, date_of_birth: v }))} />
            <SelectField label="Gender" value={form.gender} onChange={(v) => setForm((f) => ({ ...f, gender: v }))} options={[{ value: "", label: "—" }, { value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Nationality" value={form.nationality} onChange={(v) => setForm((f) => ({ ...f, nationality: v }))} />
            <TextField label="City" value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Height (cm)" type="number" value={form.height_cm} onChange={(v) => setForm((f) => ({ ...f, height_cm: v }))} />
            <TextField label="Weight (kg)" type="number" value={form.weight_kg} onChange={(v) => setForm((f) => ({ ...f, weight_kg: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
            <TextField label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <CheckboxField label="Team captain" checked={form.is_captain} onChange={(v) => setForm((f) => ({ ...f, is_captain: v }))} />
            <CheckboxField label="Vice captain" checked={form.is_vice_captain} onChange={(v) => setForm((f) => ({ ...f, is_vice_captain: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Emergency contact name" value={form.emergency_contact_name} onChange={(v) => setForm((f) => ({ ...f, emergency_contact_name: v }))} />
            <TextField label="Emergency contact phone" value={form.emergency_contact_phone} onChange={(v) => setForm((f) => ({ ...f, emergency_contact_phone: v }))} />
          </div>
          <TextAreaField label="Medical notes (optional, private — visible to tournament staff only)" value={form.medical_notes} onChange={(v) => setForm((f) => ({ ...f, medical_notes: v }))} />
          <button type="submit" disabled={isSaving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
            {isSaving && <ButtonSpinner />}
            {editing ? "Save changes" : "Add player"}
          </button>
        </form>
      </Drawer>
    </>
  );
}
