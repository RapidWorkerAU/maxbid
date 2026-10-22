-- What these fetch at auction, which is not what they resell for.
--
-- matching-and-valuation.md gives every evidence type a "Used for" column. An
-- auction result says "Resale floor and auction market" where every other
-- sold source says "Resale". That distinction was never implemented: every
-- comparable went into one average, so a hammer price counted as a resale
-- price at the joint highest weight.
--
-- A hammer price is what a reseller paid to buy. A resale price is what the
-- public paid to own. The gap between them is the margin this product exists
-- to find, so averaging them together removed the thing being measured. It is
-- why the first real measurement put the median maximum bid at 0.71 times
-- what the lot actually fetched: a profit margin was being subtracted from a
-- buy price rather than from a sell price.
--
-- The answer is not to throw the auction results away. They are the best
-- evidence we have for what it will take to win, which is a question a bidder
-- genuinely has. So they are kept here, beside the resale range rather than
-- inside it.

alter table public.triage_valuations
  add column auction_low numeric(12, 2) check (auction_low >= 0),
  add column auction_typical numeric(12, 2) check (auction_typical >= 0),
  add column auction_high numeric(12, 2) check (auction_high >= 0),
  add column auction_results integer not null default 0 check (auction_results >= 0);

-- All three or none. Two ends and no middle is not a range.
alter table public.triage_valuations
  add constraint triage_valuations_auction_all_or_nothing
  check (
    (auction_low is null and auction_typical is null and auction_high is null)
    or (auction_low is not null and auction_typical is not null and auction_high is not null)
  );

alter table public.triage_valuations
  add constraint triage_valuations_auction_runs_upwards
  check (
    auction_low is null
    or (auction_low <= auction_typical and auction_typical <= auction_high)
  );

comment on column public.triage_valuations.auction_typical is
  'What one of these usually fetches at auction. Never the resale figure: a hammer price is what a reseller paid to buy, not what the public paid to own.';
