import { useCallback, useEffect, useState } from "react";
import { fetchTable, createRow, updateRow, deleteRow } from "../../../services/supabase/adminContent";

const PAGE_SIZE = 15;

export function useAdminTable<T extends { id: string }>(table: string, searchColumn: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchTable<T>(table, { search, searchColumn, page, pageSize: PAGE_SIZE });
      setRows(result.rows);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load data");
    } finally {
      setIsLoading(false);
    }
  }, [table, searchColumn, search, page]);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = async (values: Record<string, unknown>) => {
    await createRow(table, values);
    await reload();
  };
  const update = async (id: string, values: Record<string, unknown>) => {
    await updateRow(table, id, values);
    await reload();
  };
  const remove = async (id: string) => {
    await deleteRow(table, id);
    await reload();
  };

  return {
    rows,
    total,
    page,
    setPage,
    search,
    setSearch: (v: string) => {
      setPage(1);
      setSearch(v);
    },
    isLoading,
    error,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    create,
    update,
    remove,
    reload,
  };
}
