# TournamentLive — Backend Foundation (Prompt 2)

Continuation of the Prompt 1 architecture. This prompt covers **database, auth, storage,
permissions, and backend configuration only** — no dashboard pages. Backend is
**Supabase-only**: Postgres, Supabase Auth, Supabase Storage, Supabase Realtime, and RLS.
No Firebase, no Mongo, no custom Express server. Edge Functions are used only where
Postgres/RLS genuinely can't do the job (payment webhooks, scheduled expiry).

## What's in this delivery

```
backend/
├── supabase/
│   ├── migrations/            # 15 ordered, idempotent-safe migrations (schema → RLS → storage → realtime)
│   ├── seed/
│   │   ├── seed.sql           # reference data: roles, permissions, plans, flags, templates
│   │   └── seed_demo_users.ts # demo auth users + full demo tournament (Admin API)
│   ├── types/database.types.ts
│   └── policies/permission_matrix.md
├── src/shared/validators/     # 11 Zod schema files (signup, login, tournament, team,
│                               player, match, payment, rental plan, website settings,
│                               sponsor, news, gallery)
└── .env.example
```

Run order: `supabase db push` (applies all 15 migrations) → `psql -f seed/seed.sql` →
`npx tsx seed/seed_demo_users.ts`.

---

## 1. Entity-Relationship Overview

Rather than a rendered diagram, here is the relationship map in dependency order —
this is exactly the shape you'd draw in an ERD tool from the migrations:

```
auth.users (Supabase-managed)
  └─1:1─ profiles ──n:1─ roles ──n:n─ permissions (via role_permissions)
        │  └─n:1 self (organizer_id → staff belongs to an organizer's profile)
        │
        ├─n:1─ subscriptions ──n:1─ rental_plans
        │        └─n:1─ coupons
        │
        ├─1:n─ payments ──n:1─ subscriptions, tournaments
        │        └─1:n─ transactions
        │
        ├─1:n─ api_keys
        │
        └─1:n─ tournaments (organizer_id)
                 ├─1:1─ tournament_settings
                 ├─1:1─ website_themes
                 ├─1:1─ site_settings
                 ├─1:1─ seo_settings
                 ├─1:1─ domains
                 ├─1:n─ custom_domains
                 │
                 ├─1:n─ groups
                 ├─1:n─ teams ──n:1─ groups
                 │        └─1:n─ players
                 │                 └─1:n─ player_statistics ──n:1─ matches
                 │
                 ├─1:n─ fixtures ──n:1─ groups
                 ├─1:n─ matches ──n:1─ fixtures, teams (home/away/winner)
                 │        ├─1:n─ match_events ──n:1─ teams, players
                 │        ├─1:1─ live_scores
                 │        └─1:n─ commentary
                 ├─1:n─ standings ──n:1─ groups, teams
                 │
                 ├─1:n─ sponsors
                 ├─1:n─ gallery ──n:1─ media_library
                 ├─1:n─ news ──n:1─ categories
                 ├─1:n─ testimonials, faq, contact_messages
                 ├─1:n─ live_streams ──n:1─ matches
                 └─1:n─ advertisements

media_library ──n:1─ profiles (organizer-owned asset pool; referenced by gallery/news/sponsors)
notifications ──n:1─ profiles
feature_flags, system_settings, email_templates — platform-level, no tenant FK
support_tickets ──n:1─ profiles (owner), profiles (assignee)
analytics, activity_logs, audit_logs, webhook_logs, backups — platform observability tables
```

Every child-of-tournament table cascades on delete from `tournaments`, so retiring a
tournament cleans up its entire subtree. `profiles`, `teams`, `players`, `news` use
soft-delete (`deleted_at`) instead, since those need to remain referenceable in
historical records (payments, standings, audit logs) even after removal from the UI.

---

## 2. Authentication Setup

Configured entirely through **Supabase Auth** — no custom auth server:

- **Email/password** — enabled by default; `signupSchema`/`loginSchema` (Zod) validate
  client-side before the `supabase.auth.signUp` / `signInWithPassword` calls.
- **Google login** — enabled via Supabase Dashboard → Authentication → Providers → Google,
  using `VITE_GOOGLE_OAUTH_CLIENT_ID`; redirect handled at `/auth/callback`.
- **Password reset** — `supabase.auth.resetPasswordForEmail` → user lands on
  `/reset-password` → `resetPasswordSchema` validates the new password.
- **Email verification** — `email_confirm` required before first login (configurable per
  environment; disabled only for the seeded demo accounts via the Admin API).
- **Magic Link** — available as an alternative sign-in method on `/login`, using
  `supabase.auth.signInWithOtp`.
- **Sessions & refresh tokens** — handled transparently by supabase-js; the client stores
  the session and auto-refreshes; `AuthContext` exposes `session`, `user`, and `profile`
  (joined from the `profiles` table) to the rest of the app.
- **Remember Me** — maps to Supabase's persistent session storage vs. in-memory-only
  session, toggled at login.
- **Logout** — `supabase.auth.signOut()`, clears local session and redirects to `/login`.
- **Profile creation after signup** — handled server-side by the `handle_new_auth_user()`
  trigger on `auth.users` (migration `0002`), not client code, so a profile always exists
  and can never be skipped or duplicated by a slow/failed client request.
- **Automatic role assignment** — every new signup defaults to `viewer`. Becoming an
  `organizer` happens through the onboarding/payment flow (a service-role call promotes
  the role after successful first payment), and staff roles (`manager`/`scorekeeper`/
  `commentator`) are assigned when an organizer sends an invite, which also sets
  `profiles.organizer_id`.
- **Protected routes** — client-side `<RequireAuth roles={[...]}>` guards (from Prompt 1)
  are a UX layer only; the actual authorization boundary is RLS, enforced on every query
  regardless of which route rendered it.

---

## 3. Role System

Seven roles — `super_admin`, `organizer`, `manager`, `scorekeeper`, `commentator`,
`viewer`, `guest` — stored in the `roles` table and assigned via `profiles.role_id`.
Full capability breakdown: see **`supabase/policies/permission_matrix.md`**.

Key design point: permissions are **data**, not code. `role_permissions` maps roles to
permission codes (`tournament.create`, `match.score_update`, etc.), editable from a future
Super Admin "Roles & Permissions" screen without touching the schema or redeploying. RLS
policies reference either the role name directly (for structural checks like "is this
tournament's staff") or `has_permission()` (for finer app-level capability checks) —
both read from the same database tables, so there's exactly one source of truth.

---

## 4. Backend Architecture Explanation

- **Every table has RLS enabled with zero implicit trust** — migration `0012` turns RLS on
  for all 45 tables before migration `0013` adds a single policy, so there's never a window
  where a table is enabled-but-open or silently unprotected.
- **Helper functions over repeated subqueries** — `is_super_admin()`, `effective_organizer_id()`,
  `is_tournament_staff()`, `is_tournament_scorekeeper()`, `is_publicly_visible_tournament()`
  (migration `0011`) are `SECURITY DEFINER, STABLE` functions so policy expressions stay
  short and consistent, and so the "what counts as staff of this tournament" logic lives in
  exactly one place instead of being copy-pasted into 40 policies.
- **Lifecycle state enforced at the database layer** — an `archived` tournament blocks staff
  writes via a `status <> 'archived'` check directly inside the RLS policy (not just a
  disabled button in the UI), so the read-only guarantee holds even against direct API calls.
- **Public vs. private split** — `is_publicly_visible_tournament()` intentionally excludes
  `draft`/`pending_payment`/`suspended` tournaments from anonymous reads, while still
  allowing `archived` ones through (read-only sites stay live after expiry, matching the
  product spec).
- **Audit trail without app-code discipline required** — `log_audit_event()` (migration
  `0010`) is attached as a trigger on `tournaments`, `payments`, and `subscriptions`, so
  every insert/update/delete is captured in `audit_logs` regardless of which code path
  performed it (dashboard, edge function, or direct SQL by an admin).
- **Realtime is opt-in per table** — only `live_scores`, `commentary`, `match_events`,
  `standings`, `notifications`, and `matches` are added to the `supabase_realtime`
  publication (migration `0015`); this keeps the realtime message volume focused on what
  the UI actually needs to stream, rather than broadcasting every table change.
- **Storage authorization mirrors database authorization** — object paths are prefixed with
  the owning organizer's profile id (`bucket/{organizer_id}/...`), so a single
  `effective_organizer_id()`-based policy secures uploads without needing per-file
  database lookups.

---

## 5. Backup & Disaster Recovery Strategy

- **Database backups** — Supabase Pro+ projects take automatic daily physical backups with
  point-in-time recovery (PITR); the `backups` table additionally logs any *manual* export
  triggered from the Super Admin dashboard (e.g., before a risky migration), recording
  `backup_type`, `file_url`, `size_bytes`, and `status` for audit visibility.
- **Storage backups** — Supabase Storage is backed by S3-compatible object storage with
  built-in redundancy; for extra safety, a scheduled Edge Function can periodically sync
  the `documents` and `private-files` buckets to a secondary bucket/provider — recommended
  once real customer documents start accumulating, not required at launch.
- **Recovery plan** — for accidental data loss: use Supabase PITR to restore to a
  timestamp before the incident (this restores the whole project, so use only for
  serious incidents); for a single bad write, prefer restoring the specific rows from
  `audit_logs.old_data`, which is scoped and non-destructive to everything else.
- **Disaster recovery** — migrations are the schema's source of truth in version control,
  so a fresh Supabase project can be fully reconstructed by replaying
  `supabase/migrations/*` in order, then restoring the latest database backup's data (or
  `seed.sql` for a clean environment). Vercel deployments are equally reproducible from the
  GitHub repo, so full platform recovery requires no manual, undocumented steps.

---

## 6. Security Strategy Summary

- RLS on every table (see above) is the primary boundary — not an added layer over
  otherwise-open tables.
- CORS is restricted to the app's own domains at the Supabase project level (Dashboard →
  API settings); no wildcard origins in production.
- Rate limiting recommendation: apply Supabase's built-in Auth rate limits, and add
  edge-function-level rate limiting (e.g., token bucket keyed by IP) on public write
  endpoints like `contact_messages` inserts, which are open to anonymous users by design.
- Input validation happens twice: Zod schemas client-side (fast feedback), and Postgres
  `check` constraints / RLS `with check` clauses server-side (the real enforcement,
  since client validation can always be bypassed).
- SQL injection is structurally prevented — all access goes through supabase-js's
  parameterized query builder or typed RPC calls, never raw string-concatenated SQL.
- XSS: any user-generated rich text (news `content`, `custom_css`) must be sanitized at
  render time in the frontend (e.g., DOMPurify before rendering `content` as HTML) —
  flagged here for the Prompt 6/7 site-builder and public-site-rendering work.
- CSRF is a non-issue for the Supabase REST/Realtime API, since it uses bearer-token auth
  rather than ambient cookies, but the app should still set `SameSite=Lax` on any cookies
  it does set for session persistence.
- `audit_logs` and `activity_logs` (migration `0010`) provide the forensic trail for both
  security incident review and customer support debugging.

---

**Backend Foundation Complete.**

**Ready for Prompt 3 (Authentication UI & User Management).**
