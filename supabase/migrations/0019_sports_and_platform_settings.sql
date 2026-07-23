-- =========================================================================
-- 0019_sports_and_platform_settings.sql
-- Sport Management table + platform-wide (non-tenant) settings, seeded into
-- system_settings rather than a new parallel table.
-- =========================================================================

create table public.sports (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  slug          text not null unique,
  icon          text not null default 'trophy',
  description   text,
  rules_text    text,
  scoring_system text,
  is_default    boolean not null default false,
  status        text not null default 'active' check (status in ('active','inactive')),
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger trg_sports_updated_at
  before update on public.sports
  for each row execute function public.set_updated_at();

alter table public.sports enable row level security;

create policy sports_public_read on public.sports
  for select using (status = 'active');
create policy sports_super_admin_all on public.sports
  for all using (public.is_super_admin()) with check (public.is_super_admin());

insert into public.sports (name, slug, icon, is_default, sort_order) values
  ('Football', 'football', 'circle-dot', true, 1),
  ('Cricket', 'cricket', 'target', true, 2),
  ('Basketball', 'basketball', 'circle', true, 3),
  ('Volleyball', 'volleyball', 'circle-dashed', true, 4),
  ('Kabaddi', 'kabaddi', 'users', true, 5),
  ('Badminton', 'badminton', 'feather', true, 6),
  ('Tennis', 'tennis', 'circle', true, 7),
  ('Table Tennis', 'table-tennis', 'circle-small', true, 8),
  ('Hockey', 'hockey', 'stick', true, 9),
  ('Chess', 'chess', 'crown', true, 10),
  ('Esports', 'esports', 'gamepad-2', true, 11),
  ('Athletics', 'athletics', 'timer', true, 12);

insert into public.system_settings (key, value, description) values
  ('website_name', '"TournamentLive"'::jsonb, 'Platform display name'),
  ('logo_url', 'null'::jsonb, 'Platform logo URL'),
  ('favicon_url', 'null'::jsonb, 'Platform favicon URL'),
  ('primary_color', '"#4F46E5"'::jsonb, 'Platform primary brand color'),
  ('secondary_color', '"#7C3AED"'::jsonb, 'Platform secondary brand color'),
  ('accent_color', '"#06B6D4"'::jsonb, 'Platform accent color'),
  ('default_language', '"en"'::jsonb, 'Default platform language'),
  ('default_timezone', '"Asia/Kolkata"'::jsonb, 'Default platform timezone'),
  ('default_currency', '"INR"'::jsonb, 'Default platform currency'),
  ('contact_email', '"hello@tournamentlive.app"'::jsonb, 'Public contact email'),
  ('contact_phone', 'null'::jsonb, 'Public contact phone'),
  ('whatsapp_number', 'null'::jsonb, 'Public WhatsApp contact'),
  ('social_links', '{}'::jsonb, 'Platform social media links'),
  ('seo_defaults', '{"title":"TournamentLive","description":"Rent a tournament website in minutes."}'::jsonb, 'Default SEO meta'),
  ('analytics_ids', '{}'::jsonb, 'Analytics tracking IDs (GA4, Meta Pixel, etc.)'),
  ('registration_enabled', 'true'::jsonb, 'Allow new signups'),
  ('google_login_enabled', 'true'::jsonb, 'Allow Google OAuth login'),
  ('email_verification_required', 'true'::jsonb, 'Require email verification before login'),
  ('session_timeout_minutes', '10080'::jsonb, 'Session timeout in minutes (default 7 days)'),
  ('default_signup_role', '"organizer"'::jsonb, 'Role assigned to new signups')
on conflict (key) do nothing;

create policy system_settings_public_read_branding on public.system_settings
  for select using (key in (
    'website_name','logo_url','favicon_url','primary_color','secondary_color','accent_color',
    'default_language','default_timezone','default_currency','contact_email','contact_phone',
    'whatsapp_number','social_links','seo_defaults','registration_enabled','google_login_enabled'
  ));
