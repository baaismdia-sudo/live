import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { AdminDataTable, type Column } from "../../features/admin/components/AdminDataTable";

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string | null;
  created_at: string;
  ip_address: string | null;
}

const PAGE_SIZE = 20;

export default function ActivityLogsPage() {
  const [rows, setRows] = useState<ActivityLog[]>([]);
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
    let query = supabase.from("activity_logs").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
    if (search) query = query.ilike("action", `%${search}%`);
    query.then(({ data, error: fetchError, count }) => {
      if (!mounted) return;
      if (fetchError) setError(fetchError.message);
      else {
        setRows((data ?? []) as ActivityLog[]);
        setTotal(count ?? 0);
      }
      setIsLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [page, search]);

  const columns: Column<ActivityLog>[] = [
    { header: "Action", render: (r) => <span className="font-medium text-[var(--color-heading)]">{r.action}</span> },
    { header: "Entity", render: (r) => r.entity_type ?? "—" },
    { header: "IP", render: (r) => r.ip_address ?? "—" },
    { header: "When", render: (r) => new Date(r.created_at).toLocaleString() },
  ];

  return (
    <>
      <title>Activity Logs · TournamentLive Admin</title>
      <AdminDataTable
        title="Activity Logs"
        description="A running feed of significant actions across the platform (admin actions, logins, and more)."
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        error={error}
        search={search}
        onSearchChange={(v) => { setPage(1); setSearch(v); }}
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        onPageChange={setPage}
        emptyLabel="No activity recorded yet"
      />
    </>
  );
}
