-- A new organisation gets a cost profile with nothing in it.
-- Decision record 0022.
--
-- Not a populated one. A default profit target is a guess about somebody
-- else's business, and every cost only ever reduces a bid figure, so a
-- transport rate we invented too low produces a maximum bid that is too high.
-- That is the dangerous direction to be wrong in.
--
-- An unset line is visible and asks a question. An invented one answers a
-- question nobody asked and looks like it came from somewhere.

-- Zero is a decision and unset is not, and the difference changes a bid.
-- Nullable columns already carry that distinction for the amounts, but the
-- profile as a whole needs to say whether anybody has been through it.
alter table public.cost_profiles
  add column completed_at timestamptz;

comment on column public.cost_profiles.completed_at is
  'When the user last confirmed these figures. Null means nothing here has been chosen, so no bid figure may be shown against it. Decision record 0022.';

-- profit_mode is not null with no default, which would refuse the empty
-- profile this record calls for. It becomes nullable, and null means the user
-- has not said whether they think in dollars or in a return on cost.
alter table public.cost_profiles
  alter column profit_mode drop not null;

-- repair_mode the same, for the same reason.
alter table public.cost_profiles
  alter column repair_mode drop not null;

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

  -- Something to edit and nothing to unlearn. Every figure stays null until
  -- the user sets it, and completed_at stays null until they have been
  -- through the lot, which is what stops a bid figure being shown.
  insert into public.cost_profiles (org_id, name, is_default)
  values (new_org, 'Default', true);

  update public.profiles
  set default_org_id = coalesce(default_org_id, new_org)
  where id = auth.uid();

  return new_org;
end;
$$;

comment on function public.create_organisation (text) is
  'Creates an organisation, makes the caller its owner, and gives it an empty default cost profile. Decision record 0022.';
