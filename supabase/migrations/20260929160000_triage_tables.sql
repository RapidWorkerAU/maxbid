-- What triage produces, and what every AI call costs.
-- Source: docs/02-specs/database.md. F13, S4, D33, decision record 0017.
--
-- Three tables.
--
-- ai_runs and usage_events exist so that spend is a measured figure rather
-- than a surprise on a bill. S4 is the first stage that costs money per lot,
-- and a catalogue can hold 300 of them.
--
-- lot_identifications holds what a lot was decided to be. One row per lot per
-- stage, because triage, deep analysis and the user each get a say and the
-- earlier answers are kept. is_current marks the one that counts.
--
-- product_id and category_id are in database.md and are deliberately absent
-- here. Both are nullable, products needs the pgvector extension and
-- categories needs a seeded tree, and neither belongs in a triage migration.
-- They arrive with the matching work that actually uses them.

create table public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  -- Nullable because a run may not belong to one organisation, and because a
  -- cost record must survive the analysis it came from being deleted.
  org_id uuid references public.organisations (id) on delete set null,
  analysis_id uuid references public.analyses (id) on delete set null,
  lot_id uuid references public.lots (id) on delete set null,
  -- The pipeline stage, such as S4. Kept as text so a new stage needs no
  -- migration.
  stage text not null,
  model text not null,
  -- Which version of the prompt produced this. A changed prompt changes the
  -- answers, so a result is only readable alongside the prompt that made it.
  prompt_version text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost_usd numeric(10, 5) not null default 0,
  -- Whether the call succeeded. A failed call still costs, so it is still a row.
  ok boolean not null default true,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ai_runs_analysis_idx on public.ai_runs (analysis_id);
create index ai_runs_org_created_idx on public.ai_runs (org_id, created_at desc);

comment on table public.ai_runs is
  'Every AI call, with what it cost. S4 is the first stage that spends per lot, so spend has to be measurable.';

create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organisations (id) on delete set null,
  analysis_id uuid references public.analyses (id) on delete set null,
  -- firecrawl, brave, ebay and so on. Not AI, but still money.
  provider text not null,
  units numeric not null default 1,
  cost_usd numeric(10, 5) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index usage_events_analysis_idx on public.usage_events (analysis_id);

comment on table public.usage_events is
  'Non AI spend, such as page fetches and search calls.';

create table public.lot_identifications (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses (id) on delete cascade,
  lot_id uuid not null references public.lots (id) on delete cascade,
  stage text not null check (stage in ('triage', 'deep', 'user')),
  brand text,
  model text,
  year integer,
  -- Everything else the model read, such as fuel, transmission and odometer.
  -- Free form because what matters differs by category.
  specs jsonb not null default '{}'::jsonb,
  condition_notes text,
  -- 0 to 100. Decision record 0017 sends a lot back with its photo when this
  -- comes in low, so the number has to mean something and is recorded as given.
  confidence numeric(5, 2) not null check (confidence >= 0 and confidence <= 100),
  is_current boolean not null default true,
  confirmed_by uuid references public.profiles (id) on delete set null,
  ai_run_id uuid references public.ai_runs (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One current identification per lot per analysis. A second pass supersedes
-- the first rather than sitting beside it, and this makes that a rule rather
-- than a convention.
create unique index lot_identifications_current_idx
  on public.lot_identifications (analysis_id, lot_id)
  where is_current;

create index lot_identifications_lot_idx on public.lot_identifications (lot_id);

comment on table public.lot_identifications is
  'What a lot was decided to be, by triage, by deep analysis or by the user. F13.';
