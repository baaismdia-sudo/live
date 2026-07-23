import { useState } from "react";
import { AdminDataTable, type Column } from "../../features/admin/components/AdminDataTable";
import { Drawer } from "../../features/admin/components/Drawer";
import { TextField, SelectField, CheckboxField } from "../../features/admin/components/FormField";
import { useAdminTable } from "../../features/admin/hooks/useAdminTable";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_redemptions: number | null;
  times_redeemed: number;
  valid_until: string | null;
  is_active: boolean;
}

const emptyForm = { code: "", discount_type: "percentage", discount_value: "10", max_redemptions: "", valid_until: "", is_active: true };

export default function CouponsPage() {
  const table = useAdminTable<Coupon>("coupons", "code");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };
  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: String(c.discount_value),
      max_redemptions: c.max_redemptions?.toString() ?? "",
      valid_until: c.valid_until?.slice(0, 10) ?? "",
      is_active: c.is_active,
    });
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);
    try {
      const values = {
        code: form.code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        max_redemptions: form.max_redemptions ? Number(form.max_redemptions) : null,
        valid_until: form.valid_until || null,
        is_active: form.is_active,
      };
      if (editing) await table.update(editing.id, values);
      else await table.create(values);
      setDrawerOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save coupon");
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Column<Coupon>[] = [
    { header: "Code", render: (c) => <span className="font-mono font-medium text-[var(--color-heading)]">{c.code}</span> },
    { header: "Discount", render: (c) => (c.discount_type === "percentage" ? `${c.discount_value}%` : `₹${c.discount_value}`) },
    { header: "Used", render: (c) => `${c.times_redeemed}${c.max_redemptions ? ` / ${c.max_redemptions}` : ""}` },
    { header: "Expires", render: (c) => (c.valid_until ? new Date(c.valid_until).toLocaleDateString() : "Never") },
    {
      header: "Status",
      render: (c) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.is_active ? "bg-[var(--color-success)]/10 text-[var(--color-success)]" : "bg-[var(--color-muted)]/10 text-[var(--color-muted)]"}`}>
          {c.is_active ? "Active" : "Disabled"}
        </span>
      ),
    },
  ];

  return (
    <>
      <title>Coupons · TournamentLive Admin</title>
      <AdminDataTable
        title="Coupons"
        description="Discount codes redeemable at checkout."
        columns={columns}
        rows={table.rows}
        isLoading={table.isLoading}
        error={table.error}
        search={table.search}
        onSearchChange={table.setSearch}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={(c) => table.remove(c.id)}
        page={table.page}
        totalPages={table.totalPages}
        onPageChange={table.setPage}
        emptyLabel="No coupons yet"
      />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Edit coupon" : "New coupon"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)] dark:bg-red-900/20">{formError}</p>}
          <TextField label="Code" value={form.code} onChange={(v) => setForm((f) => ({ ...f, code: v }))} />
          <SelectField label="Discount type" value={form.discount_type} onChange={(v) => setForm((f) => ({ ...f, discount_type: v }))} options={[{ value: "percentage", label: "Percentage" }, { value: "fixed", label: "Fixed amount" }]} />
          <TextField label="Discount value" type="number" value={form.discount_value} onChange={(v) => setForm((f) => ({ ...f, discount_value: v }))} />
          <TextField label="Max redemptions (blank = unlimited)" type="number" value={form.max_redemptions} onChange={(v) => setForm((f) => ({ ...f, max_redemptions: v }))} />
          <TextField label="Valid until" type="date" value={form.valid_until} onChange={(v) => setForm((f) => ({ ...f, valid_until: v }))} />
          <CheckboxField label="Active" checked={form.is_active} onChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
          <button type="submit" disabled={isSaving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
            {isSaving && <ButtonSpinner />}
            {editing ? "Save changes" : "Create coupon"}
          </button>
        </form>
      </Drawer>
    </>
  );
}
