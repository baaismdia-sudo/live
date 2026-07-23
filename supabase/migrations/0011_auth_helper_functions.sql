-- =========================================================================
-- 0011_auth_helper_functions.sql
-- Helper functions used by RLS policies. Defined as SECURITY DEFINER +
-- STABLE so they can be safely referenced inside policy expressions
-- without recursive RLS evaluation on public.profiles itself.
-- =========================================================================

-- Current user's role name ('super_admin','organizer','manager', etc.)
create or replace function public.current_role_name()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select r.name
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
  limit 1;
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_name() = 'super_admin';
$$;

-- The "organizer account" a profile belongs to: organizers own themselves,
-- staff (manager/scorekeeper/commentator) point at their organizer via
-- profiles.organizer_id.
create or replace function public.effective_organizer_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(p.organizer_id, p.id)
  from public.profiles p
  where p.id = auth.uid();
$$;

-- Is the current user the organizer (or staff of the organizer) that owns
-- the given tournament?
create or replace function public.is_tournament_staff(p_tournament_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tournaments t
    where t.id = p_tournament_id
      and t.organizer_id = public.effective_organizer_id()
  );
$$;

-- Scorekeeper/commentator role check scoped to a tournament they staff.
create or replace function public.is_tournament_scorekeeper(p_tournament_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_name() in ('scorekeeper','manager')
     and public.is_tournament_staff(p_tournament_id);
$$;

create or replace function public.is_tournament_commentator(p_tournament_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_name() in ('commentator','manager')
     and public.is_tournament_staff(p_tournament_id);
$$;

-- Fine-grained permission check against the role_permissions table.
create or replace function public.has_permission(p_permission_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.role_permissions rp on rp.role_id = p.role_id
    join public.permissions perm on perm.id = rp.permission_id
    where p.id = auth.uid()
      and perm.code = p_permission_code
  );
$$;

-- Is a tournament visible on the public site right now (published + not
-- soft-deleted)? Archived tournaments remain publicly viewable but read-only.
create or replace function public.is_publicly_visible_tournament(p_tournament_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tournaments t
    where t.id = p_tournament_id
      and t.is_public = true
      and t.deleted_at is null
      and t.status in ('active','expiring','archived')
  );
$$;
