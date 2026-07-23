-- =========================================================================
-- 0007_content.sql
-- Media library, sponsors, categories, news, gallery, testimonials, faq,
-- contact messages
-- =========================================================================

create table public.media_library (
  id            uuid primary key default gen_random_uuid(),
  organizer_id  uuid not null references public.profiles(id) on delete cascade,
  tournament_id uuid references public.tournaments(id) on delete cascade,
  file_url      text not null,
  file_type     text not null,                -- image, video, document
  file_size_bytes bigint,
  alt_text      text,
  uploaded_by   uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index idx_media_library_tournament_id on public.media_library(tournament_id);
create index idx_media_library_organizer_id  on public.media_library(organizer_id);

create table public.sponsors (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  name          text not null,
  logo_url      text,
  website_url   text,
  tier          text not null default 'bronze' check (tier in ('platinum','gold','silver','bronze')),
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_sponsors_tournament_id on public.sponsors(tournament_id);

create trigger trg_sponsors_updated_at
  before update on public.sponsors
  for each row execute function public.set_updated_at();

create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  type       text not null default 'news' check (type in ('news','faq','media')),
  created_at timestamptz not null default now()
);

create table public.news (
  id               uuid primary key default gen_random_uuid(),
  tournament_id    uuid not null references public.tournaments(id) on delete cascade,
  category_id      uuid references public.categories(id) on delete set null,
  author_id        uuid references public.profiles(id) on delete set null,
  title            text not null,
  slug             text not null,
  excerpt          text,
  content          text not null,
  cover_image_url  text,
  is_published     boolean not null default false,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz,
  unique (tournament_id, slug)
);

create index idx_news_tournament_id on public.news(tournament_id);
create index idx_news_is_published  on public.news(is_published);

create trigger trg_news_updated_at
  before update on public.news
  for each row execute function public.set_updated_at();

create table public.gallery (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  media_id      uuid not null references public.media_library(id) on delete cascade,
  caption       text,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create index idx_gallery_tournament_id on public.gallery(tournament_id);

create table public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade,  -- null = platform-level
  author_name   text not null,
  author_role   text,
  message       text not null,
  rating        int check (rating between 1 and 5),
  is_published  boolean not null default true,
  created_at    timestamptz not null default now()
);

create table public.faq (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade, -- null = platform-level FAQ
  question      text not null,
  answer        text not null,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create table public.contact_messages (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade, -- null = platform contact form
  name          text not null,
  email         citext not null,
  phone         text,
  subject       text,
  message       text not null,
  status        message_status not null default 'new',
  created_at    timestamptz not null default now()
);

create index idx_contact_messages_tournament_id on public.contact_messages(tournament_id);
