import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { ErrorState } from "../../components/ui/ErrorState";
import { updatePassword } from "../../services/supabase/auth";
import { supabase } from "../../lib/supabaseClient";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [linkStatus, setLinkStatus] = useState<"checking" | "valid" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase exchanges the recovery token in the URL for a session
    // automatically (detectSessionInUrl: true); we just confirm a session
    // now exists before letting the user set a new password.
    supabase.auth.getSession().then(({ data }) => {
      setLinkStatus(data.session ? "valid" : "invalid");
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must be at least 8 characters with an uppercase letter and a number.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await updatePassword(password);
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (linkStatus === "checking") {
    return (
      <AuthLayout title="Reset password" seoTitle="Reset Password">
        <p className="text-sm text-[var(--color-text-muted)]">Verifying your reset link...</p>
      </AuthLayout>
    );
  }

  if (linkStatus === "invalid") {
    return (
      <AuthLayout title="Link expired" seoTitle="Reset Password">
        <ErrorState
          title="This reset link is invalid or expired"
          message="Password reset links expire after a short time for your security. Request a new one to continue."
        />
        <a href="/forgot-password" className="mt-4 block text-center text-sm font-medium text-[var(--color-brand)] hover:underline">
          Request a new link
        </a>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong password you haven't used before" seoTitle="Reset Password">
      {done ? (
        <div role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
          Password changed successfully. Redirecting you to login...
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {error && (
            <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </div>
          )}
          <PasswordInput label="New password" value={password} onChange={setPassword} showStrengthMeter autoComplete="new-password" />
          <PasswordInput label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting && <ButtonSpinner />}
            Change password
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
