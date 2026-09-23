-- Auctions, lots and analyses. Source: docs/02-specs/database.md.
--
-- Two kinds of table meet here for the first time.
--
-- Shared: auction_platforms, auctions, lots, lot_images. An auction is public
-- information, and extracting it twice would cost money twice, so every
-- organisation reads the same rows. D09 says comparables are stored
-- permanently for the evidence trail, and the same reasoning applies here.
--
-- Organisation scoped: analyses and analysis_lots. What a user shortlisted and
-- what it is worth to them is theirs alone.

create table public.auction_platforms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  url_patterns text[] not null default '{}',
  default_premium_pct numeric(6, 4),
  default_premium_gst boolean not null default true,
  extractor_version text not null default '0.1.0',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.auctions (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.auction_platforms (id),
  source_url text,
  title text,
  closes_at timestamptz,
  location_text text,
  premium_pct numeric(6, 4),
  premium_gst boolean,
  -- DS12 tells the user when the premium came from a fallback rather than
  -- the auction terms, so the source has to be recorded.
  premium_source text not null default 'extracted'
    check (premium_source in ('extracted', 'platform_default', 'user')),
  raw_terms text,
  extracted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One auction per URL per platform. A PDF upload has no URL, and two
  -- uploads are two auctions, so nulls are left alone.
  unique (platform_id, source_url)
);

-- The raw payload as it arrived, before anything was parsed. Decision
-- record 0011.
create table public.raw_extract (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions (id) on delete cascade,
  source_url text,
  page integer not null default 1,
  payload jsonb not null,
  extractor_version text not null,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (auction_id, page)
);

create table public.lots (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions (id) on delete cascade,
  lot_number text not null,
  title text not null,
  description text,
  source_url text,
  location_text text,
  lat numeric,
  lng numeric,
  closes_at timestamptz,
  current_bid numeric(12, 2),
  gst_on_hammer boolean,
  -- The slice of the payload that produced this lot. The whole payload lives
  -- in raw_extract.
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (auction_id, lot_number)
);

create index lots_auction_idx on public.lots (auction_id);
create index lots_closes_at_idx on public.lots (closes_at);

create table public.lot_images (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots (id) on delete cascade,
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lot_id, position)
);

create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organisations (id) on delete cascade,
  auction_id uuid not null references public.auctions (id),
  created_by uuid not null references public.profiles (id),
  cost_profile_id uuid references public.cost_profiles (id),
  source_type text not null check (source_type in ('url', 'pdf')),
  pdf_path text,
  status text not null default 'queued'
    check (status in ('queued', 'extracting', 'triaging', 'triaged', 'deep_running', 'complete', 'failed')),
  progress_pct integer not null default 0 check (progress_pct between 0 and 100),
  premium_override_pct numeric(6, 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index analyses_org_idx on public.analyses (org_id);

create table public.analysis_lots (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses (id) on delete cascade,
  lot_id uuid not null references public.lots (id) on delete cascade,
  status text not null default 'triaged'
    check (status in ('triaged', 'shortlisted', 'deep_running', 'valued', 'failed')),
  triage_low numeric(12, 2),
  triage_high numeric(12, 2),
  triage_max_bid numeric(12, 2),
  opportunity_score integer check (opportunity_score between 0 and 100),
  is_watchlisted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One lot appears once in one analysis. Decision record 0011.
  unique (analysis_id, lot_id)
);

create index analysis_lots_analysis_idx on public.analysis_lots (analysis_id);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'auction_platforms', 'auctions', 'raw_extract', 'lots', 'lot_images',
    'analyses', 'analysis_lots'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()',
      table_name
    );
  end loop;
end;
$$;
