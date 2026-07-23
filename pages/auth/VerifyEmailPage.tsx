import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { resendVerificationEmail } from "../../services/supabase/auth";
import { supabase } from "../../lib/supabaseClient";

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string } | null)?.email ?? "";

  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Poll for verification so the user is bounced forward automatically
  // once they click the email link in another tab.
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email_confirmed_at) {
        navigate("/auth/verify-email-success", { replace: true });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setIsResending(true);
    setMessage(null);
    try {
      await resendVerificationEmail(email);
      setMessage("Verification email resent.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not resend email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout title="Verify your email" subtitle="Almost there!" seoTitle="Verify Email">
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-3xl">
          ✉️
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">
          We sent a verification link to{" "}
          <span className="font-medium text-[var(--color-text)]">{email || "your email address"}</span>.
          Click the link to activate your account. This page updates automatically once you're verified.
        </p>

        {message && <p className="text-sm text-[var(--color-brand)]">{message}</p>}

        <button
          onClick={handleResend}
          disabled={isResending || cooldown > 0}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-alt)] disabled:opacity-60"
        >
          {isResending && <ButtonSpinner />}
          {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend verification email"}
        </button>
      </div>
    </AuthLayout>
  );
}
