-- =========================================================================
-- seed.sql
-- Reference data only (roles, permissions, rental plans, feature flags,
-- email templates, system settings). User accounts (super admin, demo
-- organizer) are created via seed_demo_users.ts using the Supabase Admin
-- API, since auth.users cannot be safely seeded with plain SQL (password
-- hashing is handled by GoTrue, not the database).
-- Run order: apply all migrations, then this file, then seed_demo_users.ts.
-- =========================================================================

-- ---------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------
insert into public.roles (name, label, description, is_system) values
  ('super_admin', 'Super Admin', 'Full control over the entire platform', true),
  ('organizer',   'Organizer',   'Owns and manages their own tournaments', true),
  ('manager',     'Manager',     'Organizer-invited staff with near-full tournament access', true),
  ('scorekeeper', 'Scorekeeper', 'Can update live scores and match events', true),
  ('commentator', 'Commentator', 'Can post live commentary', true),
  ('viewer',      'Viewer',      'Registered user, read-only, default role on signup', true),
  ('guest',       'Guest',       'Unauthenticated visitor', true)
on conflict (name) do nothing;

-- ---------------------------------------------------------------------
-- Permissions (fine-grained; consumed by has_permission() in RLS/app)
-- ---------------------------------------------------------------------
insert into public.permissions (code, category, description) values
  ('platform.manage_settings',   'system',      'Manage platform-wide settings'),
  ('platform.manage_plans',      'billing',     'Create/edit rental plans and coupons'),
  ('platform.manage_organizers', 'system',      'Suspend/manage any organizer account'),
  ('platform.view_analytics',    'system',      'View platform-wide analytics'),
  ('tournament.create',          'tournaments', 'Create a new tournament'),
  ('tournament.edit',            'tournaments', 'Edit tournament details/settings'),
  ('tournament.delete',          'tournaments', 'Delete/archive a tournament'),
  ('tournament.invite_staff',    'tournaments', 'Invite manager/scorekeeper/commentator'),
  ('match.manage',               'competition', 'Create/edit fixtures and matches'),
  ('match.score_update',         'competition', 'Update live scores and match events'),
  ('content.manage',             'content',     'Manage news/gallery/sponsors/testimonials'),
  ('billing.manage_own',         'billing',     'Manage own subscription and payments')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- Role -> permission mapping
-- ---------------------------------------------------------------------
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.name = 'super_admin'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.name = 'organizer' and p.code in (
  'tournament.create','tournament.edit','tournament.delete','tournament.invite_staff',
  'match.manage','match.score_update','content.manage','billing.manage_own'
)
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.name = 'manager' and p.code in (
  'tournament.edit','tournament.invite_staff','match.manage','match.score_update','content.manage'
)
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.name = 'scorekeeper' and p.code in ('match.score_update')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.name = 'commentator' and p.code in ('match.score_update')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Rental plans
-- ---------------------------------------------------------------------
insert into public.rental_plans (name, slug, duration, price_cents, currency, features, max_teams, sort_order) values
  ('1-Day Pass',    '1-day',    '1_day',    49900,   'INR', '["custom_theme","live_scoring"]', 16, 1),
  ('3-Day Pass',    '3-day',    '3_day',    99900,   'INR', '["custom_theme","live_scoring","gallery"]', 32, 2),
  ('1-Week Pass',   '1-week',   '1_week',   199900,  'INR', '["custom_theme","live_scoring","gallery","news"]', 64, 3),
  ('2-Week Pass',   '2-week',   '2_week',   349900,  'INR', '["custom_theme","live_scoring","gallery","news","sponsors"]', 128, 4),
  ('1-Month Pass',  '1-month',  '1_month',  599900,  'INR', '["custom_theme","live_scoring","gallery","news","sponsors","custom_domain"]', null, 5),
  ('Unlimited',     'unlimited','unlimited',1499900, 'INR', '["custom_theme","live_scoring","gallery","news","sponsors","custom_domain","priority_support"]', null, 6)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- Feature flags
-- ---------------------------------------------------------------------
insert into public.feature_flags (key, name, description, is_enabled) values
  ('live_streaming',        'Live Streaming',        'Embed live stream on public tournament site', true),
  ('custom_domains',        'Custom Domains',        'Allow organizers to connect a custom domain', true),
  ('coupon_codes',          'Coupon Codes',          'Enable coupon code redemption at checkout', true),
  ('ai_match_summaries',    'AI Match Summaries',    'Auto-generate match recap articles', false)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- System settings
-- ---------------------------------------------------------------------
insert into public.system_settings (key, value, description) values
  ('maintenance_mode', 'false'::jsonb, 'Platform-wide maintenance toggle'),
  ('platform_name',    '"TournamentLive"'::jsonb, 'Displayed platform name'),
  ('support_email',    '"support@tournamentlive.app"'::jsonb, 'Support contact email')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- Email templates
-- ---------------------------------------------------------------------
insert into public.email_templates (key, subject, html_body, variables) values
  ('welcome_email', 'Welcome to TournamentLive', '<p>Hi {{full_name}}, welcome aboard!</p>', '["full_name"]'),
  ('payment_receipt', 'Your TournamentLive receipt', '<p>Payment of {{amount}} received for {{tournament_name}}.</p>', '["amount","tournament_name"]'),
  ('tournament_expiring', 'Your tournament site expires soon', '<p>{{tournament_name}} expires on {{expiry_date}}. Renew to keep it live.</p>', '["tournament_name","expiry_date"]')
on conflict (key) do nothing;
