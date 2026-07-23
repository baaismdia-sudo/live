import { supabase } from "../../lib/supabaseClient";

/**
 * Generic CRUD helpers for the simple admin lookup tables (rental_plans,
 * sports, coupons, feature_flags). Every write here relies on RLS to
 * enforce super_admin-only access — these functions don't re-check roles
 * client-side, since the database is the actual authorization boundary.
 */

export async function fetchTable<T>(
  table: string,
  opts: { search?: string; searchColumn?: string; page: number; pageSize: number; orderBy?: string }
) {
  const from = (opts.page - 1) * opts.pageSize;
  const to = from + opts.pageSize - 1;
  let query = supabase.from(table).select("*", { count: "exact" });
  if (opts.search && opts.searchColumn) {
    query = query.ilike(opts.searchColumn, `%${opts.search}%`);
  }
  query = query.order(opts.orderBy ?? "created_at", { ascending: false }).range(from, to);
  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: (data ?? []) as T[], total: count ?? 0 };
}

export async function createRow(table: string, values: Record<string, unknown>) {
  const { error } = await supabase.from(table).insert(values);
  if (error) throw error;
}

export async function updateRow(table: string, id: string, values: Record<string, unknown>) {
  const { error } = await supabase.from(table).update(values).eq("id", id);
  if (error) throw error;
}

export async function deleteRow(table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

export async function getSystemSettings() {
  const { data, error } = await supabase.from("system_settings").select("*").order("key");
  if (error) throw error;
  return data;
}

export async function updateSystemSetting(key: string, value: unknown) {
  const { error } = await supabase.from("system_settings").update({ value }).eq("key", key);
  if (error) throw error;
}
