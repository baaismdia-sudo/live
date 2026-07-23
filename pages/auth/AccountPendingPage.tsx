import { AuthLayout } from "../../layouts/AuthLayout";
import { signOut } from "../../services/supabase/auth";
import { useNavigate } from "react-router-dom";

export default function AccountPendingPage() {
  const navigate = useNavigate();
  return (
    <AuthLayout title="Account pending approval" seoTitle="Account Pending">
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl dark:bg-amber-900/30">
          ⏳
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">
          Your account is awaiting approval from our team. We'll email you as soon as it's ready — this usually
          takes less than 24 hours.
        </p>
        <button
          onClick={async () => {
            await signOut();
            navigate("/login");
          }}
          className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--color-surface-alt)]"
        >
          Log out
        </button>
      </div>
    </AuthLayout>
  );
}
