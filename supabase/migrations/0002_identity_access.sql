-- =========================================================================
-- 0002_identity_access.sql
-- Roles, permissions, profiles (extends auth.users), api keys
-- =========================================================================

-- ---------------------------------------------------------------------
-- roles  (system roles are seeded, not hardcoded in app logic)
-- ---------------------------------------------------------------------
create table public.roles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,               -- super_admin, organizer, manager, scorekeeper, commentator, viewer, guest
  label       text not null,
  description text,
  is_system   boolean not null default true,       -- system roles cannot be deleted from admin UI
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- permissions  (fine-grained capability codes, e.g. "tournament.create")
-- ---------------------------------------------------------------------
create table public.permissions (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  category    text not null,                        -- tournaments, billing, content, system...
  description text,
  created_at  timestamptz not null default now()
);

create table public.role_permissions (
  role_id       uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (role_id, permission_id)
);

-- ---------------------------------------------------------------------
-- profiles  (1:1 extension of auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  full_name      text not null,
  email          citext not null,
  avatar_url     text,
  phone          text,
  role_id        uuid not null references public.roles(id),
  -- for staff (manager / scorekeeper / commentator) this points to the organizer
  -- profile.id that owns the tournaments they are allowed to work on.
  organizer_id   uuid references public.profiles(id) on delete set null,
  status         text not null default 'active' check (status in ('active','suspended','pending')),
  last_login_at  timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

create index idx_profiles_role_id      on public.profiles(role_id);
create index idx_profiles_organizer_id on public.profiles(organizer_id);
create unique index idx_profiles_email on public.profiles(email) where deleted_at is null;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth.users row is created.
-- Default role = viewer; role is upgraded explicitly after onboarding /
-- payment flows (e.g. becoming an organizer happens via a service-role call).
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  viewer_role_id uuid;
begin
  select id into viewer_role_id from public.roles where name = 'viewer' limit 1;

  insert into public.profiles (id, full_name, email, role_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    viewer_role_id
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------
-- api_keys  (for organizer/system integrations, e.g. score-feed bots)
-- ---------------------------------------------------------------------
create table public.api_keys (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  key_hash    text not null unique,          -- never store raw keys
  key_prefix  text not null,                  -- first 8 chars, shown in UI for identification
  scopes      text[] not null default '{}',
  last_used_at timestamptz,
  expires_at  timestamptz,
  revoked_at  timestamptz,
  created_at  timestamptz not null default now()
);

create index idx_api_keys_profile_id on public.api_keys(profile_id);
