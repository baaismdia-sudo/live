import { useEffect, useState, useCallback } from "react";
import { RoleBadge, AccountStatusBadge } from "../../components/ui/Badge";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { ErrorState } from "../../components/ui/ErrorState";
import {
  listUsers,
  suspendUser,
  reactivateUser,
  deleteUser,
  exportUsersToCsv,
  type UserListFilters,
} from "../../services/supabase/adminUsers";

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  status: "active" | "suspended" | "pending";
  roles: { name: string; label: string } | null;
  last_login_at: string | null;
  created_at: string;
}

const PAGE_SIZE = 20;

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended" | "pending">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<UserListFilters["sortBy"]>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listUsers({
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        pageSize: PAGE_SIZE,
        sortBy,
        sortDirection,
      });
      setUsers(result.users as unknown as UserRow[]);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load users");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page, sortBy, sortDirection]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleSort = (column: NonNullable<UserListFilters["sortBy"]>) => {
    if (sortBy === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBulkSuspend = async () => {
    await Promise.all(Array.from(selected).map((id) => suspendUser(id)));
    setSelected(new Set());
    fetchUsers();
  };

  const handleBulkReactivate = async () => {
    await Promise.all(Array.from(selected).map((id) => reactivateUser(id)));
    setSelected(new Set());
    fetchUsers();
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} user(s)? This cannot be undone.`)) return;
    await Promise.all(Array.from(selected).map((id) => deleteUser(id)));
    setSelected(new Set());
    fetchUsers();
  };

  const handleExportCsv = () => {
    const csv = exportUsersToCsv(
      users.map((u) => ({
        name: u.full_name,
        email: u.email,
        role: u.roles?.label ?? "",
        status: u.status,
        last_login: u.last_login_at ?? "",
        created_at: u.created_at,
      }))
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6 p-6">
      <title>User Management · TournamentLive Admin</title>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Users</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{total} total accounts</p>
        </div>
        <button onClick={handleExportCsv} className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium hover:bg-[var(--color-surface-alt)]">
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search by name or email..."
          className="w-64 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value as typeof statusFilter);
          }}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>

        {selected.size > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-[var(--color-surface-alt)] px-3 py-1.5 text-sm">
            <span>{selected.size} selected</span>
            <button onClick={handleBulkSuspend} className="font-medium text-amber-600 hover:underline">Suspend</button>
            <button onClick={handleBulkReactivate} className="font-medium text-green-600 hover:underline">Reactivate</button>
            <button onClick={handleBulkDelete} className="font-medium text-red-600 hover:underline">Delete</button>
          </div>
        )}
      </div>

      {isLoading ? (
        <PageLoader label="Loading users..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-surface-alt)] text-xs uppercase text-[var(--color-text-muted)]">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size === users.length && users.length > 0}
                    onChange={(e) =>
                      setSelected(e.target.checked ? new Set(users.map((u) => u.id)) : new Set())
                    }
                  />
                </th>
                <th className="px-4 py-3">Avatar</th>
                <SortableHeader label="Name" column="full_name" sortBy={sortBy} sortDirection={sortDirection} onSort={toggleSort} />
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <SortableHeader label="Last Login" column="last_login_at" sortBy={sortBy} sortDirection={sortDirection} onSort={toggleSort} />
                <SortableHeader label="Created" column="created_at" sortBy={sortBy} sortDirection={sortDirection} onSort={toggleSort} />
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--color-surface-alt)]/50">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleSelected(u.id)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
                      {u.avatar_url && <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">{u.full_name}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.roles && <RoleBadge role={u.roles.name} label={u.roles.label} />}
                  </td>
                  <td className="px-4 py-3">
                    <AccountStatusBadge status={u.status} />
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {u.status === "suspended" ? (
                      <button onClick={() => reactivateUser(u.id).then(fetchUsers)} className="text-xs font-medium text-green-600 hover:underline">
                        Reactivate
                      </button>
                    ) : (
                      <button onClick={() => suspendUser(u.id).then(fetchUsers)} className="text-xs font-medium text-amber-600 hover:underline">
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
        <span>Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 disabled:opacity-40">
            Previous
          </button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 disabled:opacity-40">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function SortableHeader({
  label,
  column,
  sortBy,
  sortDirection,
  onSort,
}: {
  label: string;
  column: NonNullable<UserListFilters["sortBy"]>;
  sortBy: UserListFilters["sortBy"];
  sortDirection: "asc" | "desc";
  onSort: (c: NonNullable<UserListFilters["sortBy"]>) => void;
}) {
  const active = sortBy === column;
  return (
    <th className="cursor-pointer select-none px-4 py-3" onClick={() => onSort(column)}>
      {label} {active && (sortDirection === "asc" ? "↑" : "↓")}
    </th>
  );
}
