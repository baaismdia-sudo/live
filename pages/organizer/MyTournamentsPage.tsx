import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Eye, Share2, Archive, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { AdminDataTable, type Column } from "../../features/admin/components/AdminDataTable";
import {
  publishTournament, unpublishTournament, archiveTournament, deleteTournament, duplicateTournament,
} from "../../services/supabase/tournaments";

interface TournamentRow {
  id: string;
  name: string;
  slug: string;
  sport: string;
  status: string;
  logo_url: string | null;
  is_public: boolean;
  created_at: string;
  rental_ends_at: string | null;
}

const PAGE_SIZE = 15;

export default function MyTournamentsPage() {
  const [rows, setRows] = useState<TournamentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = supabase.from("tournaments").select("*", { count: "exact" }).is("deleted_at", null).order("created_at", { ascending: false }).range(from, to);
    if (search) query = query.ilike("name", `%${search}%`);
    const { data, error: fetchError, count } = await query;
    if (fetchError) setError(fetchError.message);
    else {
      setRows((data ?? []) as TournamentRow[]);
      setTotal(count ?? 0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const withReload = (fn: (id: string) => Promise<void>) => async (id: string) => {
    await fn(id);
    load();
  };

  const share = (row: TournamentRow) => {
    const url = `https://${row.slug}.tournamentlive.app`;
    navigator.clipboard.writeText(url);
    setToast(`Link copied: ${url}`);
    setTimeout(() => setToast(null), 3000);
  };

  const statusColor: Record<string, string> = {
    draft: "bg-[var(--color-muted)]/10 text-[var(--color-muted)]",
    pending_payment: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
    active: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    expiring: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
    archived: "bg-[var(--color-muted)]/10 text-[var(--color-muted)]",
    suspended: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  };

  const columns: Column<TournamentRow>[] = [
    {
      header: "Tournament",
      render: (t) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-[var(--color-surface-secondary)]">
            {t.logo_url ? <img src={t.logo_url} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-[var(--color-muted)]">🏆</span>}
          </div>
          <Link to={`/dashboard/tournaments/${t.id}`} className="font-medium text-[var(--color-heading)] hover:text-[var(--color-primary)]">
            {t.name}
          </Link>
        </div>
      ),
    },
    { header: "Sport", render: (t) => t.sport },
    { header: "Status", render: (t) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor[t.status]}`}>{t.status.replace("_", " ")}</span> },
    { header: "Website", render: (t) => (t.is_public ? <a href={`https://${t.slug}.tournamentlive.app`} target="_blank" rel="noreferrer" className="text-[var(--color-primary)] hover:underline">{t.slug}.tournamentlive.app</a> : "Private") },
    { header: "Created", render: (t) => new Date(t.created_at).toLocaleDateString() },
    {
      header: "Actions",
      render: (t) => (
        <div className="flex items-center gap-2.5">
          <button onClick={() => share(t)} aria-label="Share" className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"><Share2 size={15} /></button>
          <a href={`https://${t.slug}.tournamentlive.app`} target="_blank" rel="noreferrer" aria-label="Preview" className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"><Eye size={15} /></a>
          <button onClick={() => withReload(duplicateTournament)(t.id)} aria-label="Duplicate" className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"><Copy size={15} /></button>
          {t.status === "active" ? (
            <button onClick={() => withReload(unpublishTournament)(t.id)} aria-label="Unpublish" className="text-[var(--color-muted)] hover:text-[var(--color-warning)]"><XCircle size={15} /></button>
          ) : (
            <button onClick={() => withReload(publishTournament)(t.id)} aria-label="Publish" className="text-[var(--color-muted)] hover:text-[var(--color-success)]"><CheckCircle size={15} /></button>
          )}
          <button onClick={() => withReload(archiveTournament)(t.id)} aria-label="Archive" className="text-[var(--color-muted)] hover:text-[var(--color-danger)]"><Archive size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="relative">
      <title>My Tournaments · TournamentLive</title>
      <AdminDataTable
        title="My Tournaments"
        description="Every tournament you've created, and their current status."
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        error={error}
        search={search}
        onSearchChange={(v) => { setPage(1); setSearch(v); }}
        onDelete={(t) => withReload(deleteTournament)(t.id)}
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        onPageChange={setPage}
        emptyLabel="No tournaments yet — create your first one"
      />
      {toast && (
        <div className="fixed bottom-6 right-6 rounded-lg bg-[var(--color-heading)] px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
