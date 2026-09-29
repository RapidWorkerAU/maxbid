-- Row level security for the triage tables.
-- Source: docs/02-specs/security-and-rls.md.

alter table public.ai_runs enable row level security;
alter table public.usage_events enable row level security;
alter table public.lot_identifications enable row level security;

-- Spend is the organisation's own business. A member sees what their
-- organisation was charged and nothing else. Only the background jobs write,
-- through the service role, so there is no insert, update or delete policy:
-- a cost record a user could write would not be a cost record.
create policy ai_runs_select on public.ai_runs
  for select using (org_id is not null and public.is_org_member(org_id));

create policy usage_events_select on public.usage_events
  for select using (org_id is not null and public.is_org_member(org_id));

-- An identification belongs to an organisation through its analysis, the same
-- hop analysis_lots makes.
create policy lot_identifications_select on public.lot_identifications
  for select using (public.owns_analysis(analysis_id));

-- A user may correct an identification, which is the 'user' stage in F13 and
-- what confirmed_by records. They may not invent one for an analysis that is
-- not theirs, and they may not claim someone else confirmed it.
create policy lot_identifications_insert on public.lot_identifications
  for insert with check (
    public.can_edit_analysis(analysis_id)
    and stage = 'user'
    and confirmed_by = auth.uid()
  );

create policy lot_identifications_update on public.lot_identifications
  for update using (public.can_edit_analysis(analysis_id))
  with check (public.can_edit_analysis(analysis_id));
