import { supabase } from "../../lib/supabaseClient";

export interface UserListFilters {
  search?: string;
  roleId?: string;
  status?: "active" | "suspended" | "pending";
  page?: number;
  pageSize?: number;
  sortBy?: "created_at" | "last_login_at" | "full_name";
  sortDirection?: "asc" | "desc";
}

/**
 * All admin user-management mutations (suspend/ban/reset-password/assign-role/
 * delete) run through a single Postgres RPC guarded by `is_super_admin()`
 * rather than direct table writes, so the authorization check happens
 * server-side even if a client is compromised, and every action is captured
 * uniformly in audit_logs by the RPC body itself.
 */

export async function listUsers(filters: UserListFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, status, role_id, roles(name, label), last_login_at, created_at", {
      count: "exact",
    });

  if (filters.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }
  if (filters.roleId) query = query.eq("role_id", filters.roleId);
  if (filters.status) query = query.eq("status", filters.status);

  query = query
    .order(filters.sortBy ?? "created_at", { ascending: filters.sortDirection === "asc" })
    .range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { users: data, total: count ?? 0, page, pageSize };
}

export async function suspendUser(userId: string) {
  const { error } = await supabase.rpc("admin_set_user_status", {
    p_user_id: userId,
    p_status: "suspended",
  });
  if (error) throw error;
}

export async function reactivateUser(userId: string) {
  const { error } = await supabase.rpc("admin_set_user_status", {
    p_user_id: userId,
    p_status: "active",
  });
  if (error) throw error;
}

export async function assignRole(userId: string, roleId: string) {
  const { error } = await supabase.rpc("admin_assign_role", {
    p_user_id: userId,
    p_role_id: roleId,
  });
  if (error) throw error;
}

export async function deleteUser(userId: string) {
  const { error } = await supabase.rpc("admin_delete_user", { p_user_id: userId });
  if (error) throw error;
}

export function exportUsersToCsv(users: Array<Record<string, unknown>>): string {
  if (users.length === 0) return "";
  const headers = Object.keys(users[0]);
  const rows = users.map((u) =>
    headers.map((h) => JSON.stringify(u[h] ?? "")).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}
