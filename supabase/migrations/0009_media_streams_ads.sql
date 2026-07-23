-- =========================================================================
-- 0009_media_streams_ads.sql
-- Live streams, advertisements
-- =========================================================================

create table public.live_streams (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  match_id      uuid references public.matches(id) on delete set null,
  title         text not null,
  stream_url    text not null,
  provider      text not null default 'youtube' check (provider in ('youtube','custom','vimeo')),
  is_active     boolean not null default false,
  started_at    timestamptz,
  ended_at      timestamptz,
  created_at    timestamptz not null default now()
);

create index idx_live_streams_tournament_id on public.live_streams(tournament_id);

create table public.advertisements (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade,  -- null = platform-wide ad
  placement     ad_placement not null default 'sidebar',
  image_url     text not null,
  target_url    text,
  starts_at     timestamptz,
  ends_at       timestamptz,
  impressions   bigint not null default 0,
  clicks        bigint not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create index idx_advertisements_tournament_id on public.advertisements(tournament_id);
