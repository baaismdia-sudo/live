import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";

export default function SessionExpiredPage() {
  const navigate = useNavigate();
  return (
    <AuthLayout title="Session expired" subtitle="For your security, please log in again" seoTitle="Session Expired">
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-alt)] text-3xl">
          🔒
        </div>
        <button
          onClick={() => navigate("/login")}
          className="block w-full rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          Log in again
        </button>
        <Link to="/" className="block text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          Back to homepage
        </Link>
      </div>
    </AuthLayout>
  );
}
