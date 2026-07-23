-- =========================================================================
-- 0004_tournaments_core.sql
-- Tournaments + per-tournament configuration (settings, theme, site, seo,
-- domains) — the "no-code" surface every organizer edits.
-- =========================================================================

create table public.tournaments (
  id                 uuid primary key default gen_random_uuid(),
  organizer_id       uuid not null references public.profiles(id) on delete cascade,
  rental_plan_id     uuid references public.rental_plans(id),
  subscription_id    uuid references public.subscriptions(id) on delete set null,
  name               text not null,
  slug               text not null unique,
  sport              text not null,
  description        text,
  status             tournament_status not null default 'draft',
  cover_image_url    text,
  logo_url           text,
  is_public          boolean not null default true,
  timezone           text not null default 'Asia/Kolkata',
  starts_at          timestamptz,
  ends_at            timestamptz,
  rental_starts_at   timestamptz,
  rental_ends_at     timestamptz,               -- null = unlimited plan
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz
);

create index idx_tournaments_organizer_id on public.tournaments(organizer_id);
create index idx_tournaments_status       on public.tournaments(status);
create index idx_tournaments_slug_trgm    on public.tournaments using gin (slug gin_trgm_ops);

create trigger trg_tournaments_updated_at
  before update on public.tournaments
  for each row execute function public.set_updated_at();

alter table public.payments
  add constraint fk_payments_tournament
  foreign key (tournament_id) references public.tournaments(id) on delete set null;

create index idx_payments_tournament_id on public.payments(tournament_id);

-- ---------------------------------------------------------------------
-- tournament_settings (1:1)
-- ---------------------------------------------------------------------
create table public.tournament_settings (
  id                    uuid primary key default gen_random_uuid(),
  tournament_id         uuid not null unique references public.tournaments(id) on delete cascade,
  format                text not null default 'knockout' check (format in ('knockout','round_robin','groups_knockout','league')),
  max_teams             int,
  rules_text            text,
  registration_open     boolean not null default true,
  registration_deadline  timestamptz,
  contact_email         citext,
  contact_phone         text,
  social_links          jsonb not null default '{}',
  updated_at            timestamptz not null default now()
);

create trigger trg_tournament_settings_updated_at
  before update on public.tournament_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- website_themes (1:1) — the no-code theme editor persists here
-- ---------------------------------------------------------------------
create table public.website_themes (
  id                 uuid primary key default gen_random_uuid(),
  tournament_id      uuid not null unique references public.tournaments(id) on delete cascade,
  primary_color      text not null default '#1E3A8A',
  secondary_color    text not null default '#F59E0B',
  accent_color       text not null default '#10B981',
  font_heading       text not null default 'Poppins',
  font_body          text not null default 'Inter',
  dark_mode_enabled  boolean not null default true,
  layout_variant     text not null default 'classic' check (layout_variant in ('classic','modern','minimal')),
  custom_css         text,
  updated_at         timestamptz not null default now()
);

create trigger trg_website_themes_updated_at
  before update on public.website_themes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- site_settings (1:1) — which public-site sections are enabled
-- ---------------------------------------------------------------------
create table public.site_settings (
  id                uuid primary key default gen_random_uuid(),
  tournament_id     uuid not null unique references public.tournaments(id) on delete cascade,
  site_title        text,
  tagline           text,
  favicon_url       text,
  show_sponsors     boolean not null default true,
  show_gallery      boolean not null default true,
  show_news         boolean not null default true,
  show_live_stream  boolean not null default false,
  footer_text       text,
  maintenance_mode  boolean not null default false,
  updated_at        timestamptz not null default now()
);

create trigger trg_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- seo_settings (1:1)
-- ---------------------------------------------------------------------
create table public.seo_settings (
  id              uuid primary key default gen_random_uuid(),
  tournament_id   uuid not null unique references public.tournaments(id) on delete cascade,
  meta_title      text,
  meta_description text,
  og_image_url    text,
  keywords        text[] not null default '{}',
  canonical_url   text,
  updated_at      timestamptz not null default now()
);

create trigger trg_seo_settings_updated_at
  before update on public.seo_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- domains (subdomain, always present) + custom_domains (optional add-on)
-- ---------------------------------------------------------------------
create table public.domains (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null unique references public.tournaments(id) on delete cascade,
  subdomain     text not null unique,     -- e.g. "city-cup-2026" -> city-cup-2026.tournamentlive.app
  created_at    timestamptz not null default now()
);

create table public.custom_domains (
  id                  uuid primary key default gen_random_uuid(),
  tournament_id       uuid not null references public.tournaments(id) on delete cascade,
  domain_name         text not null unique,
  verification_status domain_verification_status not null default 'pending',
  verification_token  text not null default encode(gen_random_bytes(16), 'hex'),
  ssl_status          text not null default 'pending',
  created_at          timestamptz not null default now(),
  verified_at         timestamptz
);

create index idx_custom_domains_tournament_id on public.custom_domains(tournament_id);
