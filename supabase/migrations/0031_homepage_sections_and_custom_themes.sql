-- =========================================================================
-- 0031_homepage_sections_and_custom_themes.sql
-- NOTE: the base-template seed insert at the bottom is conditional on a
-- super_admin profile existing (used as the owning row for platform-level
-- templates) — since no super admin account has been created yet in this
-- project, it inserted zero rows. The 10 named templates (Classic, Modern,
-- Sports, Minimal, Dark, Light, Professional, Football, Cricket, Esports)
-- are implemented as a client-side constant in the Theme Manager instead,
-- which is more robust regardless of DB seed state; custom_themes is used
-- for organizer-saved/duplicated custom presets.
-- =========================================================================
alter table public.site_settings add column homepage_sections jsonb not null default
  '[{"key":"hero","visible":true},{"key":"quick_stats","visible":true},{"key":"live_matches","visible":true},{"key":"upcoming_matches","visible":true},{"key":"latest_results","visible":true},{"key":"featured_teams","visible":true},{"key":"featured_players","visible":true},{"key":"sponsors","visible":true},{"key":"news","visible":true},{"key":"gallery","visible":true}]'::jsonb;

create table public.custom_themes (
  id              uuid primary key default gen_random_uuid(),
  organizer_id    uuid not null references public.profiles(id) on delete cascade,
  name            text not null,
  primary_color   text not null,
  secondary_color text not null,
  accent_color    text not null default '#06B6D4',
  font_heading    text not null default 'Manrope',
  font_body       text not null default 'Inter',
  layout_variant  text not null default 'classic' check (layout_variant in ('classic','modern','minimal')),
  dark_mode_enabled boolean not null default true,
  is_base_template boolean not null default false,
  created_at      timestamptz not null default now()
);

create index idx_custom_themes_organizer on public.custom_themes(organizer_id);

alter table public.custom_themes enable row level security;

create policy custom_themes_owner_all on public.custom_themes
  for all using (organizer_id = public.effective_organizer_id() or is_base_template = true)
  with check (organizer_id = public.effective_organizer_id());
create policy custom_themes_super_admin_all on public.custom_themes
  for all using (public.is_super_admin()) with check (public.is_super_admin());
