import { supabase } from "../../lib/supabaseClient";
import type { SignupInput, LoginInput } from "../../shared/validators/auth.schema";

export interface RegisterPayload extends SignupInput {
  username: string;
  phoneNumber?: string;
  country: string;
  timezone: string;
  newsletterOptIn?: boolean;
}

export async function registerUser(payload: RegisterPayload) {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      emailRedirectTo: `${import.meta.env.VITE_APP_URL}/auth/verify-email-success`,
      data: {
        full_name: payload.fullName,
        username: payload.username,
        phone: payload.phoneNumber ?? null,
        country: payload.country,
        timezone: payload.timezone,
        newsletter_opt_in: payload.newsletterOptIn ?? false,
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_username_available", { p_username: username });
  if (error) throw error;
  return Boolean(data);
}

export async function loginWithPassword(payload: LoginInput) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });
  if (error) throw error;

  // Persistence mode: Supabase always persists to localStorage by default via
  // the client config; "Remember Me" = false downgrades to sessionStorage by
  // re-writing the session into a session-scoped store and clearing local.
  if (!payload.rememberMe) {
    const raw = window.localStorage.getItem("tournamentlive-auth");
    if (raw) {
      window.sessionStorage.setItem("tournamentlive-auth", raw);
      window.localStorage.removeItem("tournamentlive-auth");
    }
  }

  await supabase
    .from("profiles")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", data.user.id);

  return data;
}

export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback` },
  });
  if (error) throw error;
  return data;
}

export async function sendMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback` },
  });
  if (error) throw error;
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function updateEmail(newEmail: string) {
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) throw error;
}

export async function resendVerificationEmail(email: string) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${import.meta.env.VITE_APP_URL}/auth/verify-email-success` },
  });
  if (error) throw error;
}

export async function signOut(everywhere = false) {
  const { error } = await supabase.auth.signOut({ scope: everywhere ? "global" : "local" });
  if (error) throw error;
}

export async function getActiveSessions() {
  // Supabase does not expose a cross-device session list via supabase-js on
  // the client; this reads the audit trail of successful logins instead,
  // which is what the "Active Sessions" UI displays (device/browser/IP/time).
  const { data, error } = await supabase
    .from("activity_logs")
    .select("id, action, metadata, ip_address, created_at")
    .eq("action", "login")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw error;
  return data;
}

export async function deleteOwnAccount() {
  // Client cannot call auth.admin.deleteUser (needs service role). This
  // marks the profile for deletion; an Edge Function (service role) picks
  // up soft-deleted profiles on a schedule and performs the real deletion
  // from auth.users, keeping the destructive step off the client entirely.
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("profiles")
    .update({ deleted_at: new Date().toISOString(), status: "suspended" })
    .eq("id", userData.user.id);
  if (error) throw error;
  await signOut(true);
}
