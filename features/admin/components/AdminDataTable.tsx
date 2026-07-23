import { useState, type ReactNode } from "react";
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { TableSkeleton } from "./StatCardSkeleton";
import { ErrorState } from "../../../components/ui/ErrorState";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface AdminDataTableProps<T extends { id: string }> {
  title: string;
  description?: string;
  columns: Column<T>[];
  rows: T[];
  isLoading: boolean;
  error: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onCreate?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  emptyLabel?: string;
}

/**
 * One reusable table pattern (search, columns, row actions, pagination,
 * loading/empty/error states) backs every simple admin CRUD module —
 * Rental Plans, Sports, Coupons, Feature Flags, Audit Logs, and more — so
 * each of those is a thin config file instead of a hand-rolled table.
 */
export function AdminDataTable<T extends { id: string }>({
  title,
  description,
  columns,
  rows,
  isLoading,
  error,
  search,
  onSearchChange,
  onCreate,
  onEdit,
  onDelete,
  page,
  totalPages,
  onPageChange,
  emptyLabel = "No records found",
}: AdminDataTableProps<T>) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--color-heading)]">{title}</h1>
          {description && <p className="text-sm text-[var(--color-muted)]">{description}</p>}
        </div>
        {onCreate && (
          <button
            onClick={onCreate}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
          >
            <Plus size={16} /> Add new
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3 py-2 sm:max-w-sm">
        <Search size={16} className="text-[var(--color-muted)]" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-muted)]"
        />
      </div>

      <div className="overflow-hidden rounded-card border border-[var(--color-border)] bg-[var(--color-surface)]">
        {isLoading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="p-6">
            <ErrorState message={error} />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={Search} title={emptyLabel} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-surface-secondary)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <tr>
                  {columns.map((col) => (
                    <th key={col.header} className={`px-4 py-3 font-medium ${col.className ?? ""}`}>
                      {col.header}
                    </th>
                  ))}
                  {(onEdit || onDelete) && <th className="px-4 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--color-surface-secondary)]/50">
                    {columns.map((col) => (
                      <td key={col.header} className={`px-4 py-3 ${col.className ?? ""}`}>
                        {col.render(row)}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {onEdit && (
                            <button onClick={() => onEdit(row)} aria-label="Edit" className="text-[var(--color-muted)] hover:text-[var(--color-primary)]">
                              <Pencil size={15} />
                            </button>
                          )}
                          {onDelete && (
                            confirmDeleteId === row.id ? (
                              <div className="flex items-center gap-1.5 text-xs">
                                <button onClick={() => { onDelete(row); setConfirmDeleteId(null); }} className="font-medium text-[var(--color-danger)]">
                                  Confirm
                                </button>
                                <button onClick={() => setConfirmDeleteId(null)} className="text-[var(--color-muted)]">Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => setConfirmDeleteId(row.id)} aria-label="Delete" className="text-[var(--color-muted)] hover:text-[var(--color-danger)]">
                                <Trash2 size={15} />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 disabled:opacity-40">
              <ChevronLeft size={14} /> Previous
            </button>
            <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 disabled:opacity-40">
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
