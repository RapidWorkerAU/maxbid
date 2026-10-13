-- What a lot is and what it is worth, computed once for everybody.
-- Decision record 0024.
--
-- A 2015 Mitsubishi Outlander is a 2015 Mitsubishi Outlander whoever bought
-- it, and it resells for the same money. Only the maximum bid and the ranking
-- depend on who is asking, because they come from the buyer's own profit
-- target and GST position.
--
-- auctions and lots were already shared for that reason. Identifications and
-- resale ranges were stored per analysis, which was an accident of the order
-- things were built in. This puts them where they belong, so a nightly crawl
-- can work them out before anybody asks and the second person to look at a
-- sale waits for nothing.
--
-- pipeline.md names triage_valuation as the output of S5 and database.md never
-- held such a table. This is it.

create table public.triage_valuations (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots (id) on delete cascade,
  -- The three scenarios from matching-and-valuation.md. Conservative is what
  -- a bid figure is worked out from, because the cautious end of a range is
  -- the honest end to advise from.
  conservative numeric(12, 2) not null check (conservative >= 0),
  expected numeric(12, 2) not null check (expected >= 0),
  optimistic numeric(12, 2) not null check (optimistic >= 0),
  -- 0 to 100, so a later stage can tell a well evidenced range from a thin one.
  confidence numeric(5, 2) not null check (confidence >= 0 and confidence <= 100),
  -- How much evidence stood behind it, for F59, which shows the working.
  comparable_count integer not null default 0 check (comparable_count >= 0),
  combined_weight numeric(8, 4) not null default 0 check (combined_weight >= 0),
  -- Which version of the method produced this. A changed method changes the
  -- answer, so a figure is only readable alongside the method that made it.
  method_version text not null,
  valued_at timestamptz not null default now(),
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A range runs upwards or it is not a range.
  constraint triage_valuations_runs_upwards
    check (conservative <= expected and expected <= optimistic)
);

-- One current valuation per lot. A re-valuation supersedes the one before it
-- rather than sitting beside it, and the earlier ones are kept so a figure
-- shown last week can still be explained.
create unique index triage_valuations_current_idx
  on public.triage_valuations (lot_id)
  where is_current;

create index triage_valuations_lot_idx on public.triage_valuations (lot_id, valued_at desc);

comment on table public.triage_valuations is
  'What a lot is worth to resell. Shared, because a resale value does not depend on who is buying. Decision record 0024.';

-- An identification becomes shared as well. A null analysis means the baseline
-- everybody reads. An analysis id means one organisation corrected it for
-- themselves, and their correction is theirs alone.
alter table public.lot_identifications
  alter column analysis_id drop not null;

comment on column public.lot_identifications.analysis_id is
  'Null for the shared baseline every organisation reads. Set when one organisation has corrected it for themselves. Decision record 0024.';

-- The old index assumed every identification belonged to an analysis. There
-- are now two kinds and each needs its own rule: one current baseline per lot,
-- and one current correction per lot per analysis.
drop index if exists public.lot_identifications_current_idx;

create unique index lot_identifications_shared_current_idx
  on public.lot_identifications (lot_id)
  where is_current and analysis_id is null;

create unique index lot_identifications_own_current_idx
  on public.lot_identifications (analysis_id, lot_id)
  where is_current and analysis_id is not null;

-- triage_low and triage_high stay on analysis_lots, and become an override
-- rather than the only copy. Null now means "use the shared valuation", which
-- is the ordinary case, and a figure means this organisation disagreed.
comment on column public.analysis_lots.triage_low is
  'An organisation''s own correction to the shared resale range. Null means use triage_valuations, which is the ordinary case. Decision record 0024.';
