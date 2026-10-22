-- When a lot's current bid was last read from the site.
-- Decision record 0024, consequence 5.
--
-- A resale range a week old is fine, because resale values do not move
-- daily. A current bid from last night shown as the current bid is
-- misleading, and once sales are read on a schedule rather than when somebody
-- asks, that is the ordinary case rather than an edge one.
--
-- updated_at cannot answer this. It moves whenever any column changes, so a
-- lot whose title was corrected would claim its bid had just been checked.

alter table public.lots
  add column bid_checked_at timestamptz;

comment on column public.lots.bid_checked_at is
  'When current_bid was last read from the source page. Null means we have never read it, which is different from a bid of nothing. Decision record 0024.';

-- Reading the oldest bids first is how a refresh decides what to re-read, so
-- the order matters more than the lot does.
create index lots_bid_checked_idx on public.lots (bid_checked_at nulls first);

-- No policy change. bid_checked_at is a column on a table every signed in
-- user already reads, and nothing but the background jobs writes a lot.
