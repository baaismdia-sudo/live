import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { SuccessBanner } from "../../components/ui/ErrorState";
import { useAuth } from "../../contexts/AuthContext";
import {
  updatePassword,
  updateEmail,
  deleteOwnAccount,
  getActiveSessions,
  signOut,
} from "../../services/supabase/auth";

interface SessionRow {
  id: string;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [emailRequested, setEmailRequested] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getActiveSessions()
      .then((rows) => setSessions(rows as SessionRow[]))
      .catch(() => setSessions([]));
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("Password must be at least 8 characters with an uppercase letter and a number.");
      return;
    }
    setError(null);
    setIsSavingPassword(true);
    try {
      await updatePassword(newPassword);
      setPasswordSaved(true);
      setNewPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(newEmail)) {
      setError("Enter a valid email address");
      return;
    }
    setError(null);
    setIsSavingEmail(true);
    try {
      await updateEmail(newEmail);
      setEmailRequested(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update email");
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleExportData = async () => {
    const payload = { user, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tournamentlive-account-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setIsDeleting(true);
    try {
      await deleteOwnAccount();
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete account");
      setIsDeleting(false);
    }
  };

  const handleLogoutEverywhere = async () => {
    await signOut(true);
    navigate("/login");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-10 p-6">
      <title>Account Settings · TournamentLive</title>
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Account settings</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Security, sessions, and data controls.</p>
      </div>

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Change password */}
      <section className="space-y-3 rounded-xl border border-[var(--color-border)] p-5">
        <h2 className="font-medium text-[var(--color-text)]">Change password</h2>
        {passwordSaved && <SuccessBanner message="Password updated." />}
        <form onSubmit={handlePasswordChange} className="flex items-end gap-3">
          <div className="flex-1">
            <PasswordInput label="New password" value={newPassword} onChange={setNewPassword} showStrengthMeter autoComplete="new-password" />
          </div>
          <button
            type="submit"
            disabled={isSavingPassword}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {isSavingPassword && <ButtonSpinner />}
            Update
          </button>
        </form>
      </section>

      {/* Change email */}
      <section className="space-y-3 rounded-xl border border-[var(--color-border)] p-5">
        <h2 className="font-medium text-[var(--color-text)]">Change email</h2>
        <p className="text-sm text-[var(--color-text-muted)]">Current: {user?.email}</p>
        {emailRequested && <SuccessBanner message="Check your new inbox to confirm the change." />}
        <form onSubmit={handleEmailChange} className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium">New email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
            />
          </div>
          <button
            type="submit"
            disabled={isSavingEmail}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {isSavingEmail && <ButtonSpinner />}
            Update
          </button>
        </form>
      </section>

      {/* Sessions */}
      <section className="space-y-3 rounded-xl border border-[var(--color-border)] p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-[var(--color-text)]">Active sessions</h2>
          <button onClick={handleLogoutEverywhere} className="text-sm font-medium text-[var(--color-danger)] hover:underline">
            Log out of all devices
          </button>
        </div>
        <ul className="divide-y divide-[var(--color-border)]">
          {sessions.length === 0 && <li className="py-3 text-sm text-[var(--color-text-muted)]">No recent login activity.</li>}
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-3 text-sm">
              <span className="text-[var(--color-text)]">{s.ip_address ?? "Unknown IP"}</span>
              <span className="text-[var(--color-text-muted)]">{new Date(s.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Data export */}
      <section className="space-y-3 rounded-xl border border-[var(--color-border)] p-5">
        <h2 className="font-medium text-[var(--color-text)]">Export your data</h2>
        <p className="text-sm text-[var(--color-text-muted)]">Download a copy of your account information.</p>
        <button onClick={handleExportData} className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-surface-alt)]">
          Download account data
        </button>
      </section>

      {/* Delete account */}
      <section className="space-y-3 rounded-xl border border-[var(--color-danger)]/40 p-5">
        <h2 className="font-medium text-[var(--color-danger)]">Delete account</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          This permanently deactivates your account and all associated tournament sites. Type{" "}
          <strong>DELETE</strong> to confirm.
        </p>
        <div className="flex gap-3">
          <input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-danger)]"
          />
          <button
            onClick={handleDeleteAccount}
            disabled={deleteConfirmText !== "DELETE" || isDeleting}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-danger)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
          >
            {isDeleting && <ButtonSpinner />}
            Delete account
          </button>
        </div>
      </section>
    </div>
  );
}
