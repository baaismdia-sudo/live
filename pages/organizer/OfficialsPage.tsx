import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { AdminDataTable, type Column } from "../../features/admin/components/AdminDataTable";
import { Drawer } from "../../features/admin/components/Drawer";
import { TextField, SelectField, TextAreaField } from "../../features/admin/components/FormField";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";

interface Official {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: string;
  certification: string | null;
  experience_years: number | null;
}

const ROLES = [
  { value: "referee", label: "Referee" },
  { value: "commentator", label: "Commentator" },
  { value: "manager", label: "Manager" },
  { value: "scorekeeper", label: "Scorekeeper" },
  { value: "volunteer", label: "Volunteer" },
];

const emptyForm = { full_name: "", email: "", phone: "", role: "referee", certification: "", experience_years: "", availability_notes: "" };

export default function OfficialsPage() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<Official[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Official | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    const { data, error: fetchError } = await supabase.from("officials").select("*").order("full_name");
    if (fetchError) setError(fetchError.message);
    else setRows((data ?? []) as Official[]);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDrawerOpen(true); };
  const openEdit = (o: Official) => {
    setEditing(o);
    setForm({ full_name: o.full_name, email: o.email ?? "", phone: o.phone ?? "", role: o.role, certification: o.certification ?? "", experience_years: o.experience_years?.toString() ?? "", availability_notes: "" });
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    try {
      const values = { ...form, experience_years: form.experience_years ? Number(form.experience_years) : null, organizer_id: profile.id };
      if (editing) await supabase.from("officials").update(values).eq("id", editing.id);
      else await supabase.from("officials").insert(values);
      setDrawerOpen(false);
      load();
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (o: Official) => { await supabase.from("officials").delete().eq("id", o.id); load(); };

  const columns: Column<Official>[] = [
    { header: "Name", render: (o) => <span className="font-medium text-[var(--color-heading)]">{o.full_name}</span> },
    { header: "Role", render: (o) => <span className="capitalize">{o.role}</span> },
    { header: "Contact", render: (o) => o.email ?? o.phone ?? "—" },
    { header: "Experience", render: (o) => (o.experience_years ? `${o.experience_years} yrs` : "—") },
  ];

  return (
    <>
      <title>Officials · TournamentLive</title>
      <AdminDataTable title="Officials" description="Referees, commentators, scorekeepers, and volunteers you can assign to matches." columns={columns} rows={rows} isLoading={isLoading} error={error} search="" onSearchChange={() => {}} onCreate={openCreate} onEdit={openEdit} onDelete={remove} page={1} totalPages={1} onPageChange={() => {}} emptyLabel="No officials added yet" />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Edit official" : "New official"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Full name" value={form.full_name} onChange={(v) => setForm((f) => ({ ...f, full_name: v }))} />
          <SelectField label="Role" value={form.role} onChange={(v) => setForm((f) => ({ ...f, role: v }))} options={ROLES} />
          <TextField label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
          <TextField label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
          <TextField label="Certification" value={form.certification} onChange={(v) => setForm((f) => ({ ...f, certification: v }))} />
          <TextField label="Years of experience" type="number" value={form.experience_years} onChange={(v) => setForm((f) => ({ ...f, experience_years: v }))} />
          <TextAreaField label="Availability notes" value={form.availability_notes} onChange={(v) => setForm((f) => ({ ...f, availability_notes: v }))} />
          <button type="submit" disabled={isSaving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
            {isSaving && <ButtonSpinner />}
            {editing ? "Save changes" : "Add official"}
          </button>
        </form>
      </Drawer>
    </>
  );
}
