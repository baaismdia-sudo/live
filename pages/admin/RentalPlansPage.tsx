import { useState } from "react";
import { Copy } from "lucide-react";
import { AdminDataTable, type Column } from "../../features/admin/components/AdminDataTable";
import { Drawer } from "../../features/admin/components/Drawer";
import { useAdminTable } from "../../features/admin/hooks/useAdminTable";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";

interface RentalPlan {
  id: string;
  name: string;
  slug: string;
  duration: string;
  price_cents: number;
  currency: string;
  features: string[];
  max_teams: number | null;
  is_active: boolean;
  sort_order: number;
}

const DURATIONS = ["1_day", "3_day", "1_week", "2_week", "1_month", "unlimited"];

const emptyForm = {
  name: "",
  slug: "",
  duration: "1_day",
  price_cents: 0,
  currency: "INR",
  features: "",
  max_teams: "",
  is_active: true,
  sort_order: 0,
};

export default function RentalPlansPage() {
  const table = useAdminTable<RentalPlan>("rental_plans", "name");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<RentalPlan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const openEdit = (plan: RentalPlan) => {
    setEditing(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      duration: plan.duration,
      price_cents: plan.price_cents,
      currency: plan.currency,
      features: plan.features.join(", "),
      max_teams: plan.max_teams?.toString() ?? "",
      is_active: plan.is_active,
      sort_order: plan.sort_order,
    });
    setDrawerOpen(true);
  };

  const duplicate = async (plan: RentalPlan) => {
    await table.create({
      name: `${plan.name} (Copy)`,
      slug: `${plan.slug}-copy-${Date.now()}`,
      duration: plan.duration,
      price_cents: plan.price_cents,
      currency: plan.currency,
      features: plan.features,
      max_teams: plan.max_teams,
      is_active: false,
      sort_order: plan.sort_order + 1,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);
    try {
      const values = {
        name: form.name,
        slug: form.slug,
        duration: form.duration,
        price_cents: Number(form.price_cents),
        currency: form.currency,
        features: form.features.split(",").map((f) => f.trim()).filter(Boolean),
        max_teams: form.max_teams ? Number(form.max_teams) : null,
        is_active: form.is_active,
        sort_order: Number(form.sort_order),
      };
      if (editing) {
        await table.update(editing.id, values);
      } else {
        await table.create(values);
      }
      setDrawerOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save plan");
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Column<RentalPlan>[] = [
    { header: "Name", render: (p) => <span className="font-medium text-[var(--color-heading)]">{p.name}</span> },
    { header: "Duration", render: (p) => <span className="capitalize">{p.duration.replace("_", " ")}</span> },
    { header: "Price", render: (p) => new Intl.NumberFormat("en-IN", { style: "currency", currency: p.currency, maximumFractionDigits: 0 }).format(p.price_cents / 100) },
    { header: "Max Teams", render: (p) => p.max_teams ?? "Unlimited" },
    {
      header: "Status",
      render: (p) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.is_active ? "bg-[var(--color-success)]/10 text-[var(--color-success)]" : "bg-[var(--color-muted)]/10 text-[var(--color-muted)]"}`}>
          {p.is_active ? "Active" : "Disabled"}
        </span>
      ),
    },
    {
      header: "Duplicate",
      render: (p) => (
        <button onClick={() => duplicate(p)} className="text-[var(--color-muted)] hover:text-[var(--color-primary)]" aria-label="Duplicate plan">
          <Copy size={15} />
        </button>
      ),
    },
  ];

  return (
    <>
      <title>Rental Plans · TournamentLive Admin</title>
      <AdminDataTable
        title="Rental Plans"
        description="The pricing tiers organizers see at checkout and on the landing page."
        columns={columns}
        rows={table.rows}
        isLoading={table.isLoading}
        error={table.error}
        search={table.search}
        onSearchChange={table.setSearch}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={(p) => table.remove(p.id)}
        page={table.page}
        totalPages={table.totalPages}
        onPageChange={table.setPage}
        emptyLabel="No rental plans yet"
      />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Edit plan" : "New plan"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)] dark:bg-red-900/20">{formError}</p>}
          <TextField label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
          <TextField label="Slug" value={form.slug} onChange={(v) => setForm((f) => ({ ...f, slug: v }))} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Duration</label>
            <select
              value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>{d.replace("_", " ")}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Price (in paise)" type="number" value={String(form.price_cents)} onChange={(v) => setForm((f) => ({ ...f, price_cents: Number(v) }))} />
            <TextField label="Currency" value={form.currency} onChange={(v) => setForm((f) => ({ ...f, currency: v }))} />
          </div>
          <TextField label="Max teams (blank = unlimited)" type="number" value={form.max_teams} onChange={(v) => setForm((f) => ({ ...f, max_teams: v }))} />
          <TextField label="Features (comma-separated)" value={form.features} onChange={(v) => setForm((f) => ({ ...f, features: v }))} />
          <TextField label="Sort order" type="number" value={String(form.sort_order)} onChange={(v) => setForm((f) => ({ ...f, sort_order: Number(v) }))} />
          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="rounded" />
            Active (visible on pricing page)
          </label>
          <button
            type="submit"
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
          >
            {isSaving && <ButtonSpinner />}
            {editing ? "Save changes" : "Create plan"}
          </button>
        </form>
      </Drawer>
    </>
  );
}

function TextField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
      />
    </div>
  );
}
