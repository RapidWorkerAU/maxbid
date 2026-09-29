-- Recording that a sale's results have been gathered. Decision record 0021.
--
-- There is no public index of past auction results, so MaxBid keeps its own.
-- When a sale closes, every lot we extracted from it is revisited and what it
-- sold for is stored. These columns are what stops a sale being revisited
-- twice and let an interrupted harvest be finished.

alter table public.auctions
  add column results_harvested_at timestamptz,
  -- How many lots were read, so a partial harvest is visible rather than
  -- looking the same as a complete one.
  add column results_harvested_count integer not null default 0;

comment on column public.auctions.results_harvested_at is
  'When this sale''s results were gathered. Null means not yet, and a sale is only worth harvesting once every lot has closed.';

-- A lot that did not sell is a fact worth keeping. "This model has failed to
-- sell three times" says something about demand that an absence never could.
alter table public.lots
  add column sold_price numeric(12, 2) check (sold_price is null or sold_price >= 0),
  add column sold_at timestamptz,
  add column bid_count integer check (bid_count is null or bid_count >= 0),
  -- Set when the lot closed without selling. Distinct from sold_price being
  -- null, which only means we have not looked yet.
  add column did_not_sell boolean;

comment on column public.lots.did_not_sell is
  'True when the lot closed without selling. Null means its result has not been read yet, which is not the same thing.';

-- A sold lot has a price, and a lot that did not sell does not. Anything else
-- is a contradiction, and a contradiction in evidence is worse than a gap.
alter table public.lots
  add constraint lots_result_is_consistent
  check (not (did_not_sell and sold_price is not null));

-- Finding the sales worth harvesting: closed, and not yet gathered.
create index auctions_to_harvest_idx
  on public.auctions (closes_at)
  where results_harvested_at is null;
