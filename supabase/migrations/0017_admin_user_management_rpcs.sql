-- =========================================================================
-- 0017_admin_user_management_rpcs.sql
-- RPCs backing the Super Admin user-management UI. Each is SECURITY DEFINER
-- but re-checks is_super_admin() internally before doing anything, so the
-- privilege escalation happens only after an explicit server-side check —
-- never implied by merely being a SECURITY DEFINER function.
-- =========================================================================

create or replace function public.admin_set_user_status(p_user_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Only super admins may change account status';
  end if;
  if p_status not in ('active','suspended','pending') then
    raise exception 'Invalid status: %', p_status;
  end if;

  update public.profiles set status = p_status where id = p_user_id;

  insert into public.activity_logs (profile_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'admin_set_user_status', 'profiles', p_user_id, jsonb_build_object('status', p_status));
end;
$$;

create or replace function public.admin_assign_role(p_user_id uuid, p_role_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Only super admins may assign roles';
  end if;

  update public.profiles set role_id = p_role_id where id = p_user_id;

  insert into public.activity_logs (profile_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'admin_assign_role', 'profiles', p_user_id, jsonb_build_object('role_id', p_role_id));
end;
$$;

-- Soft-deletes the profile; a scheduled Edge Function using the service-role
-- key performs the actual auth.users deletion, since that call requires the
-- Admin API and cannot run under a user JWT regardless of RPC privileges.
create or replace function public.admin_delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Only super admins may delete accounts';
  end if;

  update public.profiles
  set deleted_at = now(), status = 'suspended'
  where id = p_user_id;

  insert into public.activity_logs (profile_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'admin_delete_user', 'profiles', p_user_id, '{}'::jsonb);
end;
$$;
