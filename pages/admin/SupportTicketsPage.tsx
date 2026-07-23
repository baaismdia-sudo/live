import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { AdminDataTable, type Column } from "../../features/admin/components/AdminDataTable";
import { Drawer } from "../../features/admin/components/Drawer";
import { SelectField, TextAreaField } from "../../features/admin/components/FormField";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
}

const PAGE_SIZE = 15;

export default function SupportTicketsPage() {
  const [rows, setRows] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = supabase.from("support_tickets").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
    if (search) query = query.ilike("subject", `%${search}%`);
    const { data, error: fetchError, count } = await query;
    if (fetchError) setError(fetchError.message);
    else {
      setRows((data ?? []) as Ticket[]);
      setTotal(count ?? 0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const saveTicket = async () => {
    if (!selected) return;
    setIsSaving(true);
    await supabase
      .from("support_tickets")
      .update({ status: selected.status, priority: selected.priority, resolved_at: selected.status === "resolved" ? new Date().toISOString() : null })
      .eq("id", selected.id);
    setIsSaving(false);
    setSelected(null);
    load();
  };

  const priorityColor: Record<string, string> = {
    low: "bg-[var(--color-muted)]/10 text-[var(--color-muted)]",
    medium: "bg-[var(--color-info)]/10 text-[var(--color-info)]",
    high: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
    urgent: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  };

  const columns: Column<Ticket>[] = [
    { header: "Subject", render: (t) => <span className="font-medium text-[var(--color-heading)]">{t.subject}</span> },
    { header: "Priority", render: (t) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColor[t.priority]}`}>{t.priority}</span> },
    { header: "Status", render: (t) => <span className="capitalize">{t.status.replace("_", " ")}</span> },
    { header: "Created", render: (t) => new Date(t.created_at).toLocaleDateString() },
  ];

  return (
    <>
      <title>Support Tickets · TournamentLive Admin</title>
      <AdminDataTable
        title="Support Tickets"
        description="User support requests, assignable and trackable through resolution."
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        error={error}
        search={search}
        onSearchChange={(v) => { setPage(1); setSearch(v); }}
        onEdit={(t) => setSelected(t)}
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        onPageChange={setPage}
        emptyLabel="No support tickets yet"
      />

      <Drawer open={Boolean(selected)} onClose={() => setSelected(null)} title="Ticket details">
        {selected && (
          <div className="space-y-4">
            <div>
              <p className="font-medium text-[var(--color-heading)]">{selected.subject}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-text)]">{selected.message}</p>
            </div>
            <SelectField
              label="Status"
              value={selected.status}
              onChange={(v) => setSelected((s) => (s ? { ...s, status: v as Ticket["status"] } : s))}
              options={[
                { value: "open", label: "Open" },
                { value: "in_progress", label: "In progress" },
                { value: "resolved", label: "Resolved" },
                { value: "closed", label: "Closed" },
              ]}
            />
            <SelectField
              label="Priority"
              value={selected.priority}
              onChange={(v) => setSelected((s) => (s ? { ...s, priority: v as Ticket["priority"] } : s))}
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
              ]}
            />
            <TextAreaField label="Internal note (not sent to user)" value="" onChange={() => {}} />
            <button
              onClick={saveTicket}
              disabled={isSaving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
            >
              {isSaving && <ButtonSpinner />}
              Save
            </button>
          </div>
        )}
      </Drawer>
    </>
  );
}
