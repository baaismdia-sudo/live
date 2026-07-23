import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";
import { PasswordInput, generateStrongPassword } from "../../components/ui/PasswordInput";
import { GoogleButton } from "../../components/ui/GoogleButton";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { InlineFieldError } from "../../components/ui/ErrorState";
import { registerUser, loginWithGoogle, isUsernameAvailable } from "../../services/supabase/auth";

const COUNTRIES = ["India", "United States", "United Kingdom", "United Arab Emirates", "Singapore", "Other"];
const TIMEZONES = ["Asia/Kolkata", "Asia/Dubai", "Asia/Singapore", "Europe/London", "America/New_York", "UTC"];

interface FormState {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  country: string;
  timezone: string;
  agreedToTerms: boolean;
  newsletterOptIn: boolean;
}

const initialState: FormState = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  country: "India",
  timezone: "Asia/Kolkata",
  agreedToTerms: false,
  newsletterOptIn: false,
};

function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (form.firstName.trim().length < 2) errors.firstName = "First name is too short";
  if (form.lastName.trim().length < 1) errors.lastName = "Last name is required";
  if (!/^[a-z0-9_]{3,20}$/i.test(form.username)) {
    errors.username = "3-20 characters: letters, numbers, underscores only";
  }
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Enter a valid email address";
  if (form.password.length < 8) errors.password = "At least 8 characters";
  else if (!/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
    errors.password = "Include an uppercase letter and a number";
  }
  if (form.confirmPassword !== form.password) errors.confirmPassword = "Passwords do not match";
  if (!form.agreedToTerms) errors.agreedToTerms = "You must accept the terms to continue";
  return errors;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const liveErrors = useMemo(() => validate(form), [form]);
  const isValid = Object.keys(liveErrors).length === 0;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const checkUsername = async () => {
    if (!/^[a-z0-9_]{3,20}$/i.test(form.username)) return;
    try {
      const available = await isUsernameAvailable(form.username);
      if (!available) {
        setErrors((e) => ({ ...e, username: "This username is already taken" }));
      }
    } catch {
      // non-fatal — server-side unique constraint is the real guard
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setServerError(null);
    setIsSubmitting(true);
    try {
      await registerUser({
        fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        password: form.password,
        confirmPassword: form.confirmPassword,
        country: form.country,
        timezone: form.timezone,
        agreedToTerms: true,
        newsletterOptIn: form.newsletterOptIn,
      });
      navigate("/verify-email", { state: { email: form.email } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      if (message.toLowerCase().includes("already registered")) {
        setServerError("An account with this email already exists.");
      } else {
        setServerError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Google sign-up failed");
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your organizer account"
      subtitle="Set up your workspace and start renting tournament websites"
      seoTitle="Sign Up"
    >
      <div className="space-y-5">
        <GoogleButton onClick={handleGoogleSignup} isLoading={isGoogleLoading} label="Sign up with Google" />

        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
          <div className="h-px flex-1 bg-[var(--color-border)]" />
          OR
          <div className="h-px flex-1 bg-[var(--color-border)]" />
        </div>

        {serverError && (
          <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">First name</label>
              <input
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
              />
              <InlineFieldError message={errors.firstName} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Last name</label>
              <input
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
              />
              <InlineFieldError message={errors.lastName} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Username</label>
            <input
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              onBlur={checkUsername}
              placeholder="e.g. kodungallur_organizer"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
            />
            <InlineFieldError message={errors.username} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
            />
            <InlineFieldError message={errors.email} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Phone number (optional)</label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => update("phoneNumber", e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Country</label>
              <select
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Timezone</label>
              <select
                value={form.timezone}
                onChange={(e) => update("timezone", e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]"
              >
                {TIMEZONES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <PasswordInput
            label="Password"
            value={form.password}
            onChange={(v) => update("password", v)}
            error={errors.password}
            showStrengthMeter
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => update("password", generateStrongPassword())}
            className="text-xs font-medium text-[var(--color-brand)] hover:underline"
          >
            Generate a strong password
          </button>

          <PasswordInput
            label="Confirm password"
            value={form.confirmPassword}
            onChange={(v) => update("confirmPassword", v)}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <label className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
            <input
              type="checkbox"
              checked={form.agreedToTerms}
              onChange={(e) => update("agreedToTerms", e.target.checked)}
              className="mt-0.5 rounded"
            />
            <span>
              I agree to the{" "}
              <Link to="/terms" className="text-[var(--color-brand)] hover:underline">Terms of Service</Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-[var(--color-brand)] hover:underline">Privacy Policy</Link>
            </span>
          </label>
          <InlineFieldError message={errors.agreedToTerms} />

          <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <input
              type="checkbox"
              checked={form.newsletterOptIn}
              onChange={(e) => update("newsletterOptIn", e.target.checked)}
              className="rounded"
            />
            Send me product updates and tips
          </label>

          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <ButtonSpinner />}
            Create account
          </button>
        </form>

        <p className="text-center text-sm text-[var(--color-text-muted)]">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-[var(--color-brand)] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
