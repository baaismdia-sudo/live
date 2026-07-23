import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PageLoader } from "../components/ui/LoadingSpinner";

/**
 * Client-side route guards are a UX layer only — the real authorization
 * boundary is Postgres RLS. These exist so unauthenticated/unauthorized
 * users see the right page instantly instead of a flash of protected UI
 * followed by empty data from a denied query.
 */

export function RequireAuth({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: string[];
}) {
  const { session, isLoading, isEmailVerified, roleName, profile } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader label="Checking your session..." />;

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (profile?.status === "suspended") {
    return <Navigate to="/access-denied" replace state={{ reason: "suspended" }} />;
  }

  if (profile?.status === "pending") {
    return <Navigate to="/account-pending" replace />;
  }

  if (roles && roles.length > 0 && (!roleName || !roles.includes(roleName))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

export function RequireGuest({ children }: { children: ReactNode }) {
  const { session, isLoading } = useAuth();
  if (isLoading) return <PageLoader label="Loading..." />;
  if (session) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function RequirePermission({
  children,
  permission,
  hasPermission,
}: {
  children: ReactNode;
  permission: string;
  hasPermission: (code: string) => boolean;
}) {
  if (!hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
}
