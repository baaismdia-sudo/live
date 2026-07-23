import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { AdminDataTable, type Column } from "../../features/admin/components/AdminDataTable";

interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: "insert" | "update" | "delete";
  created_at: string;
  profile_id: string | null;
}

const PAGE_SIZE = 20;

export default function AuditLogsPage() {
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = supabase.from("audit_logs").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
    if (search) query = query.ilike("table_name", `%${search}%`);
    query.then(({ data, error: fetchError, count }) => {
      if (!mounted) return;
      if (fetchError) setError(fetchError.message);
      else {
        setRows((data ?? []) as AuditLog[]);
        setTotal(count ?? 0);
      }
      setIsLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [page, search]);

  const actionColor: Record<string, string> = {
    insert: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    update: "bg-[var(--color-info)]/10 text-[var(--color-info)]",
    delete: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  };

  const columns: Column<AuditLog>[] = [
    { header: "Table", render: (r) => <span className="font-mono text-xs">{r.table_name}</span> },
    { header: "Record ID", render: (r) => <span className="font-mono text-xs text-[var(--color-muted)]">{r.record_id.slice(0, 8)}...</span> },
    { header: "Action", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${actionColor[r.action]}`}>{r.action}</span> },
    { header: "When", render: (r) => new Date(r.created_at).toLocaleString() },
  ];

  return (
    <>
      <title>Audit Logs · TournamentLive Admin</title>
      <AdminDataTable
        title="Audit Logs"
        description="Every insert, update, and delete on tournaments, payments, and subscriptions."
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        error={error}
        search={search}
        onSearchChange={(v) => { setPage(1); setSearch(v); }}
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        onPageChange={setPage}
        emptyLabel="No audit events recorded yet"
      />
    </>
  );
}
