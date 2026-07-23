import { useState } from "react";
import { AdminDataTable, type Column } from "../../features/admin/components/AdminDataTable";
import { Drawer } from "../../features/admin/components/Drawer";
import { TextField, TextAreaField, SelectField } from "../../features/admin/components/FormField";
import { useAdminTable } from "../../features/admin/hooks/useAdminTable";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";

interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  rules_text: string | null;
  scoring_system: string | null;
  status: "active" | "inactive";
  is_default: boolean;
}

const emptyForm = { name: "", slug: "", icon: "trophy", description: "", rules_text: "", scoring_system: "", status: "active" };

export default function SportsPage() {
  const table = useAdminTable<Sport>("sports", "name");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Sport | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const openEdit = (sport: Sport) => {
    setEditing(sport);
    setForm({
      name: sport.name,
      slug: sport.slug,
      icon: sport.icon,
      description: sport.description ?? "",
      rules_text: sport.rules_text ?? "",
      scoring_system: sport.scoring_system ?? "",
      status: sport.status,
    });
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);
    try {
      if (editing) await table.update(editing.id, form);
      else await table.create(form);
      setDrawerOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save sport");
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Column<Sport>[] = [
    { header: "Name", render: (s) => <span className="font-medium text-[var(--color-heading)]">{s.name}</span> },
    { header: "Slug", render: (s) => <span className="font-mono text-xs text-[var(--color-muted)]">{s.slug}</span> },
    { header: "Default", render: (s) => (s.is_default ? "Yes" : "Custom") },
    {
      header: "Status",
      render: (s) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.status === "active" ? "bg-[var(--color-success)]/10 text-[var(--color-success)]" : "bg-[var(--color-muted)]/10 text-[var(--color-muted)]"}`}>
          {s.status}
        </span>
      ),
    },
  ];

  return (
    <>
      <title>Sports · TournamentLive Admin</title>
      <AdminDataTable
        title="Sports"
        description="Sports available when organizers create a tournament."
        columns={columns}
        rows={table.rows}
        isLoading={table.isLoading}
        error={table.error}
        search={table.search}
        onSearchChange={table.setSearch}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={(s) => table.remove(s.id)}
        page={table.page}
        totalPages={table.totalPages}
        onPageChange={table.setPage}
        emptyLabel="No sports configured"
      />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Edit sport" : "New sport"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)] dark:bg-red-900/20">{formError}</p>}
          <TextField label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
          <TextField label="Slug" value={form.slug} onChange={(v) => setForm((f) => ({ ...f, slug: v }))} />
          <TextField label="Icon (Lucide icon name)" value={form.icon} onChange={(v) => setForm((f) => ({ ...f, icon: v }))} />
          <TextAreaField label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} />
          <TextAreaField label="Rules" value={form.rules_text} onChange={(v) => setForm((f) => ({ ...f, rules_text: v }))} />
          <TextField label="Scoring system" value={form.scoring_system} onChange={(v) => setForm((f) => ({ ...f, scoring_system: v }))} />
          <SelectField label="Status" value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
          <button type="submit" disabled={isSaving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
            {isSaving && <ButtonSpinner />}
            {editing ? "Save changes" : "Create sport"}
          </button>
        </form>
      </Drawer>
    </>
  );
}
