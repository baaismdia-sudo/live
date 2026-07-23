import { Link } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";

export default function VerifyEmailSuccessPage() {
  return (
    <AuthLayout title="Email verified!" seoTitle="Email Verified">
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl dark:bg-green-900/30">
          ✅
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">
          Your email has been verified. You can now log in and start building your tournament website.
        </p>
        <Link
          to="/login"
          className="block w-full rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          Continue to login
        </Link>
      </div>
    </AuthLayout>
  );
}
