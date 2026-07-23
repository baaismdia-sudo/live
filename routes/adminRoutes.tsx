import type { RouteObject } from "react-router-dom";
import { RequireAuth } from "./guards";
import AdminLayout from "../layouts/AdminLayout";
import DashboardHomePage from "../pages/admin/DashboardHomePage";
import RentalPlansPage from "../pages/admin/RentalPlansPage";
import RentalEnquiriesPage from "../pages/admin/RentalEnquiriesPage";
import SportsPage from "../pages/admin/SportsPage";
import CouponsPage from "../pages/admin/CouponsPage";
import FeatureFlagsPage from "../pages/admin/FeatureFlagsPage";
import SystemSettingsPage from "../pages/admin/SystemSettingsPage";
import AuditLogsPage from "../pages/admin/AuditLogsPage";
import ActivityLogsPage from "../pages/admin/ActivityLogsPage";
import ContactMessagesPage from "../pages/admin/ContactMessagesPage";
import SupportTicketsPage from "../pages/admin/SupportTicketsPage";
import EmailTemplatesPage from "../pages/admin/EmailTemplatesPage";
import UserManagementPage from "../pages/admin/UserManagementPage";
import ComingSoonPage from "../pages/admin/ComingSoonPage";

// Every sidebar destination not yet built with real CRUD (see the Prompt 5
// delivery notes) routes to ComingSoonPage so navigation never dead-ends.
const DEFERRED_PATHS = [
  "website-builder", "homepage-builder", "navigation-builder", "footer-builder", "themes",
  "subscriptions", "taxes", "payment-settings", "roles", "permissions", "organizers",
  "tournaments", "teams", "players", "matches", "live-scores", "news", "gallery",
  "sponsors", "cms", "blog", "faq", "testimonials", "advertisements", "notifications",
  "analytics", "reports", "media-library", "domains", "custom-domains", "api-keys",
  "webhook-logs", "backup",
];

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: (
      <RequireAuth roles={["super_admin"]}>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardHomePage /> },
      { path: "rental-plans", element: <RentalPlansPage /> },
      { path: "rental-enquiries", element: <RentalEnquiriesPage /> },
      { path: "sports", element: <SportsPage /> },
      { path: "coupons", element: <CouponsPage /> },
      { path: "feature-flags", element: <FeatureFlagsPage /> },
      { path: "system-settings", element: <SystemSettingsPage /> },
      { path: "audit-logs", element: <AuditLogsPage /> },
      { path: "activity-logs", element: <ActivityLogsPage /> },
      { path: "contact-messages", element: <ContactMessagesPage /> },
      { path: "support-tickets", element: <SupportTicketsPage /> },
      { path: "email-templates", element: <EmailTemplatesPage /> },
      { path: "users", element: <UserManagementPage /> },
      ...DEFERRED_PATHS.map((path) => ({ path, element: <ComingSoonPage /> })),
    ],
  },
];
