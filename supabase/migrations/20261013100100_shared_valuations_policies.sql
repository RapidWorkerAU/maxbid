-- Row level security for shared valuations and shared identifications.
-- Source: docs/02-specs/security-and-rls.md. Decision record 0024.

alter table public.triage_valuations enable row level security;

-- A resale value is the same whoever is buying, so any signed in user reads
-- it, the same way they read an auction or a lot. Only the background jobs
-- write one: a valuation a user could write would not be a valuation.
create policy triage_valuations_select on public.triage_valuations
  for select to authenticated using (true);

-- The identification policies have to change with the column. The old ones
-- assumed every row belonged to an analysis, so a shared row with a null
-- analysis would have been invisible to everybody.
drop policy if exists lot_identifications_select on public.lot_identifications;
drop policy if exists lot_identifications_insert on public.lot_identifications;
drop policy if exists lot_identifications_update on public.lot_identifications;

-- The shared baseline is readable by any signed in user. A correction is
-- readable only by the organisation that made it.
create policy lot_identifications_select on public.lot_identifications
  for select to authenticated
  using (analysis_id is null or public.owns_analysis(analysis_id));

-- A user may correct an identification for their own analysis. They may not
-- write the shared baseline, which is what every other organisation reads,
-- and they may not pass their correction off as a triage answer or attribute
-- it to somebody else.
create policy lot_identifications_insert on public.lot_identifications
  for insert with check (
    analysis_id is not null
    and public.can_edit_analysis(analysis_id)
    and stage = 'user'
    and confirmed_by = auth.uid()
  );

create policy lot_identifications_update on public.lot_identifications
  for update
  using (analysis_id is not null and public.can_edit_analysis(analysis_id))
  with check (analysis_id is not null and public.can_edit_analysis(analysis_id));
