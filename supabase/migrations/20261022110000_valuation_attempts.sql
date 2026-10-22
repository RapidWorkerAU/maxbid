-- A record that we tried to value a lot and could not. O19.
--
-- A lot that fails the minimum evidence rule stores no range, because a range
-- that cannot be trusted must not exist for a screen to read. The effect was
-- that nothing remembered the attempt, so every analysis paid the search, the
-- model call and the page fetches again and failed again. On the real Grays
-- sale that was 8 of 30 lots, and a nightly crawl would have retried every one
-- of them every night.
--
-- This is deliberately not a row in triage_valuations. That table answers what
-- a lot is worth, and its constraint says a range runs upwards or it is not a
-- range. A failed attempt is not a worth, and loosening that constraint to
-- hold one would make every reader of the table check for a range that is not
-- there.

create table public.valuation_attempts (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots (id) on delete cascade,
  -- Which method tried. A changed method is a reason to try again at once,
  -- the same rule as decision record 0025 uses for reusing a range.
  method_version text not null,
  attempted_at timestamptz not null default now(),
  -- How much evidence was found, so a lot that found almost enough can be
  -- told from one that found none. This is what says whether the archive
  -- growing is likely to help.
  comparable_count integer not null default 0 check (comparable_count >= 0),
  combined_weight numeric(8, 4) not null default 0 check (combined_weight >= 0),
  created_at timestamptz not null default now(),
  -- One row per lot per method. A later attempt replaces what it learned
  -- rather than adding a second account of the same failure, because the only
  -- question asked of this table is when we last tried.
  constraint valuation_attempts_one_per_method unique (lot_id, method_version)
);

create index valuation_attempts_lot_idx
  on public.valuation_attempts (lot_id, attempted_at desc);

comment on table public.valuation_attempts is
  'That we tried to value a lot and found too little evidence. Shared, because the evidence does not depend on who is asking. O19.';
