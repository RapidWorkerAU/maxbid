-- A comparable one organisation has decided does not belong. F62.
--
-- The columns for this already exist on lot_comparables, and they cannot be
-- used. They were written when the evidence belonged to an analysis. Decision
-- record 0024 made the identification a shared baseline, so the evidence
-- hanging off it is shared too, and can_edit_identification is false for a
-- baseline: nobody could exclude anything.
--
-- Fixing that by letting somebody write the shared row would mean one
-- organisation excluding a comparable changed the resale range every other
-- organisation sees for that lot, which is the thing decision record 0024
-- exists to prevent.
--
-- So an exclusion lives where every other organisation specific judgement
-- lives: on the analysis. The comparable stays a shared fact and what this
-- organisation thinks of it stays theirs.

create table public.comparable_exclusions (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses (id) on delete cascade,
  -- The judgement we made about this comparable against this lot, which is
  -- the thing being set aside.
  lot_comparable_id uuid not null references public.lot_comparables (id) on delete cascade,
  -- F62 requires one. An exclusion with no reason is just a missing number,
  -- and nobody could tell later why the figure moved.
  reason text not null check (length(trim(reason)) > 0),
  excluded_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Excluded or not. A second row for the same pair would be the same
  -- judgement twice.
  unique (analysis_id, lot_comparable_id)
);

create index comparable_exclusions_analysis_idx
  on public.comparable_exclusions (analysis_id);

comment on table public.comparable_exclusions is
  'Comparables one organisation set aside for one analysis, with the reason. The comparable itself stays shared. F62, decision record 0024.';
