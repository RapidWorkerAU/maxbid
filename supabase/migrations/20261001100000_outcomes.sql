-- What actually happened to a lot. F37. Source: docs/02-specs/database.md.
--
-- The harvester already records what every lot fetched under the hammer. This
-- records what the user did about it, which is the part nobody else can know:
-- whether they bid, what they paid, and what they resold it for.
--
-- Without this, nothing can say whether an estimate was right. An auction
-- price is below a resale price, and that gap is the margin a reseller works
-- in, so comparing a resale estimate to a hammer price measures the business
-- model rather than the estimate.

create table public.outcomes (
  id uuid primary key default gen_random_uuid(),
  analysis_lot_id uuid not null references public.analysis_lots (id) on delete cascade,
  result text not null check (result in ('won', 'lost', 'not_bid', 'passed_in')),
  -- What they paid, which may differ from what the lot fetched if they bought
  -- it after the auction or through a different channel.
  hammer_price numeric(12, 2) check (hammer_price is null or hammer_price >= 0),
  actual_costs numeric(12, 2) check (actual_costs is null or actual_costs >= 0),
  resale_price numeric(12, 2) check (resale_price is null or resale_price >= 0),
  -- Where they sold it. Free text, because the channels differ by trade and a
  -- fixed list would be wrong for somebody.
  resale_channel text,
  sold_at date,
  -- Consent to pooled use, for a later phase. Nothing reads it yet, and it is
  -- false unless the user says otherwise.
  share_anonymised boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One outcome per lot per analysis. A correction replaces it rather than
  -- adding a second record of what happened.
  unique (analysis_lot_id)
);

-- A lot they did not buy cannot have a resale price. Recording one would put
-- a figure on a trade that never happened.
alter table public.outcomes
  add constraint outcomes_only_a_bought_lot_resells
  check (result = 'won' or (resale_price is null and sold_at is null));

-- A resale price with no date cannot be aged, and a date with no price says
-- nothing. Either both or neither.
alter table public.outcomes
  add constraint outcomes_resale_has_a_date
  check ((resale_price is null) = (sold_at is null));

create index outcomes_analysis_lot_idx on public.outcomes (analysis_lot_id);

comment on table public.outcomes is
  'What the user did about a lot and what they made. The only source of truth for whether a resale estimate was right. F37.';
