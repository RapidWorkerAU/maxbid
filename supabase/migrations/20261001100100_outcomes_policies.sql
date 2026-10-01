-- Row level security for outcomes. Source: docs/02-specs/security-and-rls.md.
--
-- An outcome belongs to an organisation through its analysis lot, which
-- belongs to an analysis. Two hops, so it gets its own helper for the same
-- reason the others have one: a policy that read the table it guards would
-- recurse.

create or replace function public.owns_analysis_lot(target_analysis_lot uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.analysis_lots al
    where al.id = target_analysis_lot
      and public.owns_analysis(al.analysis_id)
  );
$$;

create or replace function public.can_edit_analysis_lot(target_analysis_lot uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.analysis_lots al
    where al.id = target_analysis_lot
      and public.can_edit_analysis(al.analysis_id)
  );
$$;

alter table public.outcomes enable row level security;

create policy outcomes_select on public.outcomes
  for select using (public.owns_analysis_lot(analysis_lot_id));

-- Unlike every other table in the pipeline, the user writes this one. What
-- they bought and what they made is theirs to record, and nothing else can
-- know it.
create policy outcomes_insert on public.outcomes
  for insert with check (public.can_edit_analysis_lot(analysis_lot_id));

create policy outcomes_update on public.outcomes
  for update using (public.can_edit_analysis_lot(analysis_lot_id))
  with check (public.can_edit_analysis_lot(analysis_lot_id));

create policy outcomes_delete on public.outcomes
  for delete using (public.can_edit_analysis_lot(analysis_lot_id));
