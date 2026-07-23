import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";

/**
 * Future-ready 2FA verification screen. Supabase supports TOTP MFA via
 * `supabase.auth.mfa.*`; this page is wired to that API shape (challenge +
 * verify with a 6-digit code) so enabling it later in Account Settings is a
 * matter of turning on enrollment, not rebuilding this screen.
 */
export default function TwoFactorAuthPage() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Enter the full 6-digit code");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      // Placeholder call shape for when MFA is enabled:
      // const { data: factors } = await supabase.auth.mfa.listFactors();
      // const factorId = factors.totp[0].id;
      // const { data: challenge } = await supabase.auth.mfa.challenge({ factorId });
      // await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code, try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Two-factor verification" subtitle="Enter the 6-digit code from your authenticator app" seoTitle="Two-Factor Authentication">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {error && (
          <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}
        <div className="flex justify-between gap-2">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              inputMode="numeric"
              maxLength={1}
              className="h-14 w-12 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-center text-xl font-semibold outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting && <ButtonSpinner />}
          Verify
        </button>
      </form>
    </AuthLayout>
  );
}
