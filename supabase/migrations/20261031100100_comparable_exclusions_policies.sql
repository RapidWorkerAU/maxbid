-- Row level security for comparable exclusions.
-- Source: docs/02-specs/security-and-rls.md. F62.

alter table public.comparable_exclusions enable row level security;

-- An organisation reads and writes its own exclusions and nobody else's. This
-- is the one judgement in the evidence trail that belongs to the user rather
-- than to the pipeline, so unlike every other table here they may write it.
create policy comparable_exclusions_select on public.comparable_exclusions
  for select using (public.owns_analysis(analysis_id));

-- The reason and the person are both required by the table. The policy adds
-- that somebody may only record themselves as the person who did it, so an
-- exclusion always says truthfully who set the comparable aside.
create policy comparable_exclusions_insert on public.comparable_exclusions
  for insert with check (
    public.can_edit_analysis(analysis_id) and excluded_by = auth.uid()
  );

-- Changing their mind is putting the comparable back, which is a delete. An
-- update policy would let the reason be rewritten after the fact, and the
-- reason is the record of why a figure moved.
create policy comparable_exclusions_delete on public.comparable_exclusions
  for delete using (public.can_edit_analysis(analysis_id));
