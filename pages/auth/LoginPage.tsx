import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "../../layouts/AuthLayout";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { GoogleButton } from "../../components/ui/GoogleButton";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { loginSchema, type LoginInput } from "../../shared/validators/auth.schema";
import { loginWithPassword, loginWithGoogle } from "../../services/supabase/auth";

const MAX_ATTEMPTS_BEFORE_WARNING = 3;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const onSubmit = async (values: LoginInput) => {
    setServerError(null);
    if (password.length < 1) {
      setServerError("Password is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await loginWithPassword({ ...values, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setAttempts((a) => a + 1);
      const message = err instanceof Error ? err.message : "Something went wrong";
      if (message.toLowerCase().includes("email not confirmed")) {
        navigate("/verify-email", { state: { email: values.email } });
        return;
      }
      if (message.toLowerCase().includes("invalid login credentials")) {
        setServerError("Incorrect email or password.");
      } else {
        setServerError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Google sign-in failed");
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to manage your tournaments" seoTitle="Log In">
      <div className="space-y-5">
        <GoogleButton onClick={handleGoogleLogin} isLoading={isGoogleLoading} />

        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
          <div className="h-px flex-1 bg-[var(--color-border)]" />
          OR
          <div className="h-px flex-1 bg-[var(--color-border)]" />
        </div>

        {attempts >= MAX_ATTEMPTS_BEFORE_WARNING && (
          <div role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            Multiple failed attempts detected. Consider resetting your password if you're unsure of it.
          </div>
        )}

        {serverError && (
          <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              aria-invalid={Boolean(errors.email)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
            />
            {errors.email && <p role="alert" className="mt-1 text-sm text-[var(--color-danger)]">{errors.email.message}</p>}
          </div>

          <PasswordInput
            label="Password"
            value={password}
            onChange={setPassword}
            error={errors.password?.message}
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <input type="checkbox" {...register("rememberMe")} defaultChecked className="rounded" />
              Remember me
            </label>
            <Link to="/forgot-password" className="font-medium text-[var(--color-brand)] hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting && <ButtonSpinner />}
            Log in
          </button>
        </form>

        <p className="text-center text-sm text-[var(--color-text-muted)]">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-[var(--color-brand)] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
