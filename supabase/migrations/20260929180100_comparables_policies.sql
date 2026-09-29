-- Row level security for the evidence tables.
-- Source: docs/02-specs/security-and-rls.md.

-- An identification belongs to an organisation through its analysis. This goes
-- one hop further, from a lot_comparables row to that identification, and is
-- SECURITY DEFINER for the same reason the other helpers are: the policy would
-- otherwise read a table it guards.
create or replace function public.owns_identification(target_identification uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.lot_identifications i
    where i.id = target_identification
      and public.owns_analysis(i.analysis_id)
  );
$$;

create or replace function public.can_edit_identification(target_identification uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.lot_identifications i
    where i.id = target_identification
      and public.can_edit_analysis(i.analysis_id)
  );
$$;

alter table public.comparables enable row level security;
alter table public.comparable_snapshots enable row level security;
alter table public.lot_comparables enable row level security;

-- A listing is the same listing whoever looks at it, so the shared ones are
-- readable by any signed in user. One a user supplied themselves stays theirs.
create policy comparables_select on public.comparables
  for select to authenticated
  using (org_id is null or public.is_org_member(org_id));

-- Prices are only meaningful next to the listing they belong to, so a snapshot
-- is readable exactly when its comparable is.
create policy comparable_snapshots_select on public.comparable_snapshots
  for select to authenticated
  using (
    exists (
      select 1
      from public.comparables c
      where c.id = comparable_id
        and (c.org_id is null or public.is_org_member(c.org_id))
    )
  );

-- Only the background jobs write evidence, so there is no insert or update
-- policy on either. A price a user could write would not be evidence.

-- A match belongs to whoever owns the analysis behind it.
create policy lot_comparables_select on public.lot_comparables
  for select using (public.owns_identification(identification_id));

-- The one thing a user may change is whether a comparable counts. F62. They
-- may not change the price, the weight or the reason it was matched, because
-- those are the evidence rather than their opinion of it.
create policy lot_comparables_update on public.lot_comparables
  for update using (public.can_edit_identification(identification_id))
  with check (public.can_edit_identification(identification_id));
