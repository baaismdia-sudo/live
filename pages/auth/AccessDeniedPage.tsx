import { useLocation, Link } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";

export default function AccessDeniedPage() {
  const location = useLocation();
  const reason = (location.state as { reason?: string } | null)?.reason;

  const message =
    reason === "suspended"
      ? "Your account has been suspended. Contact support if you believe this is a mistake."
      : "You don't have permission to view this page.";

  return (
    <AuthLayout title="Access denied" seoTitle="Access Denied">
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl dark:bg-red-900/30">
          🚫
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">{message}</p>
        <Link
          to="/"
          className="block w-full rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          Back to homepage
        </Link>
      </div>
    </AuthLayout>
  );
}
