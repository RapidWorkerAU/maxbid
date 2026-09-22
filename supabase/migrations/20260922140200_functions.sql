-- Functions that read the tables, and the triggers that use them.
-- Source: docs/02-specs/security-and-rls.md and docs/02-specs/configuration.md.
--
-- This runs after the tables, because a function declared `language sql` is
-- parsed and validated when it is created. Only plpgsql resolves its tables
-- at run time.
--
-- The membership helpers are SECURITY DEFINER on purpose. A policy on
-- organisation_members that calls a function which reads organisation_members
-- would recurse forever under row level security. These functions read only
-- the memberships of the caller, so the exception is one row wide.

-- Is the caller a member of this organisation.
create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.organisation_members m
    where m.org_id = target_org
      and m.user_id = auth.uid()
  );
$$;

-- The caller's role in this organisation, or null when they are not a member.
create or replace function public.org_role(target_org uuid)
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select m.role
  from public.organisation_members m
  where m.org_id = target_org
    and m.user_id = auth.uid();
$$;

-- Owners and admins manage members, settings and cost profiles.
create or replace function public.is_org_admin(target_org uuid)
returns boolean
language sql
stable
as $$
  select public.org_role(target_org) in ('owner', 'admin');
$$;

-- Buyer or above. A viewer is read only.
create or replace function public.can_edit_org(target_org uuid)
returns boolean
language sql
stable
as $$
  select public.org_role(target_org) in ('owner', 'admin', 'buyer');
$$;

-- Every new auth user gets a profile row, so nothing downstream has to check.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Creates an organisation and makes the caller its owner, in one transaction.
-- Without this a new user could not insert their own first membership, because
-- the membership policy requires them to be an admin already.
create or replace function public.create_organisation(org_name text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  new_org uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to create an organisation.';
  end if;

  insert into public.organisations (name)
  values (org_name)
  returning id into new_org;

  insert into public.organisation_members (org_id, user_id, role)
  values (new_org, auth.uid(), 'owner');

  update public.profiles
  set default_org_id = coalesce(default_org_id, new_org)
  where id = auth.uid();

  return new_org;
end;
$$;

-- Organisation locks, enforced on every write rather than in the interface.
-- Source: the precedence rules in docs/02-specs/configuration.md.
--
-- Fixed means the organisation value is used at every lower layer.
-- Floor means a lower layer may hold or raise the value, never lower it.
create or replace function public.enforce_org_locks()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  lock_row public.org_settings%rowtype;
  org_number numeric;
  new_number numeric;
begin
  select * into lock_row
  from public.org_settings s
  where s.org_id = new.org_id
    and s.key = new.key;

  if not found or lock_row.lock_type = 'none' then
    return new;
  end if;

  if lock_row.lock_type = 'fixed' then
    if new.value is distinct from lock_row.value then
      raise exception
        'Your organisation has fixed the setting %. Ask an owner or admin to change it.',
        new.key
        using errcode = 'check_violation';
    end if;
    return new;
  end if;

  if lock_row.lock_type = 'floor' then
    if jsonb_typeof(lock_row.value) <> 'number' or jsonb_typeof(new.value) <> 'number' then
      raise exception
        'The setting % has a floor set by your organisation, so it must be a number.',
        new.key
        using errcode = 'check_violation';
    end if;

    org_number := (lock_row.value #>> '{}')::numeric;
    new_number := (new.value #>> '{}')::numeric;

    if new_number < org_number then
      raise exception
        'Your organisation set a floor of % for %. You can raise this value but not lower it.',
        org_number, new.key
        using errcode = 'check_violation';
    end if;
    return new;
  end if;

  return new;
end;
$$;

-- A new auth user always gets a profile.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Organisation locks are enforced here, not only in the interface.
create trigger enforce_locks_on_user_preferences
  before insert or update on public.user_preferences
  for each row execute function public.enforce_org_locks();
