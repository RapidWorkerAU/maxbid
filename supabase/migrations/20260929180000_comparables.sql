-- The evidence a valuation rests on. Source: docs/02-specs/database.md.
--
-- Three tables rather than one, because a listing, its price and the reason it
-- was matched to a lot are three different things with three different
-- lifetimes.
--
-- comparables is the listing itself, seen once and reused. A 2015 Outlander
-- advertised on carsales is the same listing whoever looks at it, so it is
-- shared across organisations the same way an auction is. D09 keeps them
-- permanently, because a bid figure has to stay explainable after the listing
-- is taken down.
--
-- comparable_snapshots is what it cost when we looked. A listing's price
-- moves, and it ends up sold or withdrawn, so the price is dated rather than
-- overwritten.
--
-- lot_comparables is the judgement: this listing matches this lot, this well,
-- for this reason. It carries the weight the valuation used, so a figure can
-- be taken apart afterwards. F62 lets a user exclude one, and the reason is
-- required, because an excluded comparable with no reason is just a missing
-- number.

create table public.comparables (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (
    source_type in (
      'auction_result',
      'marketplace_sold',
      'advertised_used',
      'new_retail',
      'outcome',
      'user_supplied'
    )
  ),
  -- Null for shared evidence. Set only for a comparable a user supplied
  -- themselves, which stays theirs.
  org_id uuid references public.organisations (id) on delete cascade,
  provenance text not null check (provenance in ('verified', 'extracted', 'estimated', 'user_input')),
  source_name text not null,
  url text unique,
  title text not null,
  -- Our own words. D44 keeps third party listing text and images out of the
  -- product, so this is a summary rather than a copy.
  summary text,
  condition text check (condition in ('new', 'used', 'unknown')),
  year integer,
  location_text text,
  features jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comparables_source_idx on public.comparables (source_type, year);

create table public.comparable_snapshots (
  id uuid primary key default gen_random_uuid(),
  comparable_id uuid not null references public.comparables (id) on delete cascade,
  price numeric(12, 2) not null check (price >= 0),
  price_includes_gst boolean,
  status text not null check (status in ('active', 'sold', 'ended')),
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comparable_snapshots_lookup_idx
  on public.comparable_snapshots (comparable_id, checked_at desc);

create table public.lot_comparables (
  id uuid primary key default gen_random_uuid(),
  identification_id uuid not null references public.lot_identifications (id) on delete cascade,
  comparable_id uuid not null references public.comparables (id) on delete cascade,
  snapshot_id uuid not null references public.comparable_snapshots (id) on delete cascade,
  match_level text not null check (
    match_level in ('exact', 'near_exact', 'higher_spec', 'lower_spec', 'similar_alternative', 'insufficient')
  ),
  -- Plain English, because the user reads this to decide whether to trust the
  -- figure. ux-standards.md and the writing rules apply to it.
  reason text not null,
  differences jsonb not null default '{}'::jsonb,
  adjustment_pct numeric(6, 4) not null default 0,
  adjusted_price numeric(12, 2) not null,
  weight numeric(6, 4) not null,
  excluded_by_user boolean not null default false,
  exclusion_reason text,
  excluded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One judgement per listing per identification.
  unique (identification_id, comparable_id),
  -- An exclusion with no reason is just a missing number, and the user would
  -- have no way to tell later why the figure moved. F62.
  constraint lot_comparables_exclusion_has_a_reason
    check (not excluded_by_user or (exclusion_reason is not null and length(trim(exclusion_reason)) > 0))
);

create index lot_comparables_identification_idx
  on public.lot_comparables (identification_id);

comment on table public.comparables is
  'Every comparable listing ever seen. Shared, because a listing is the same listing whoever looks at it.';
comment on table public.comparable_snapshots is
  'What a comparable cost when we looked. Prices move, so they are dated rather than overwritten.';
comment on table public.lot_comparables is
  'Why a listing was matched to a lot, how well, and the weight the valuation gave it.';
