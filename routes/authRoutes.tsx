import type { RouteObject } from "react-router-dom";
import { RequireAuth, RequireGuest } from "./guards";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import VerifyEmailSuccessPage from "../pages/auth/VerifyEmailSuccessPage";
import AccountPendingPage from "../pages/auth/AccountPendingPage";
import AccessDeniedPage from "../pages/auth/AccessDeniedPage";
import SessionExpiredPage from "../pages/auth/SessionExpiredPage";
import TwoFactorAuthPage from "../pages/auth/TwoFactorAuthPage";
import LogoutPage from "../pages/auth/LogoutPage";
import ProfilePage from "../pages/account/ProfilePage";
import AccountSettingsPage from "../pages/account/AccountSettingsPage";

export const authRoutes: RouteObject[] = [
  { path: "/login", element: <RequireGuest><LoginPage /></RequireGuest> },
  { path: "/register", element: <RequireGuest><RegisterPage /></RequireGuest> },
  { path: "/forgot-password", element: <RequireGuest><ForgotPasswordPage /></RequireGuest> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/verify-email", element: <VerifyEmailPage /> },
  { path: "/auth/verify-email-success", element: <VerifyEmailSuccessPage /> },
  { path: "/account-pending", element: <AccountPendingPage /> },
  { path: "/unauthorized", element: <AccessDeniedPage /> },
  { path: "/access-denied", element: <AccessDeniedPage /> },
  { path: "/session-expired", element: <SessionExpiredPage /> },
  { path: "/two-factor", element: <TwoFactorAuthPage /> },
  { path: "/logout", element: <LogoutPage /> },

  { path: "/account/profile", element: <RequireAuth><ProfilePage /></RequireAuth> },
  { path: "/account/settings", element: <RequireAuth><AccountSettingsPage /></RequireAuth> },
];
