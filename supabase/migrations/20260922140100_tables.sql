-- The first eight tables. Source: docs/02-specs/database.md.
-- Every table carries created_at and updated_at.

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'free'
    check (plan in ('free', 'starter', 'pro', 'dealer', 'internal')),
  stripe_customer_id text,
  gst_registered boolean not null default false,
  base_address text,
  base_lat numeric,
  base_lng numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  default_org_id uuid references public.organisations (id) on delete set null,
  alert_lead_minutes integer not null default 30 check (alert_lead_minutes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organisation_members (
  org_id uuid not null references public.organisations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'buyer', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create index organisation_members_user_idx on public.organisation_members (user_id);

create table public.cost_profiles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organisations (id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  profit_mode text not null default 'dollars' check (profit_mode in ('dollars', 'percent')),
  target_profit_amount numeric(12, 2),
  target_return_pct numeric(6, 4),
  min_profit_amount numeric(12, 2),
  min_return_pct numeric(6, 4),
  transport_base_fee numeric(12, 2),
  transport_rate_per_km numeric(8, 2),
  -- A percentage applies to the GST inclusive resale the bid is calculated
  -- from, per decision record 0005.
  repair_mode text not null default 'dollars'
    check (repair_mode in ('dollars', 'percent_of_resale')),
  repair_value numeric(12, 4),
  defaults jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cost_profiles_org_idx on public.cost_profiles (org_id);

-- Only one default cost profile per organisation, so a new lot always knows
-- which one it inherits.
create unique index cost_profiles_one_default_per_org
  on public.cost_profiles (org_id)
  where is_default;

create table public.org_settings (
  org_id uuid not null references public.organisations (id) on delete cascade,
  key text not null,
  value jsonb not null,
  lock_type text not null default 'none' check (lock_type in ('none', 'fixed', 'floor')),
  updated_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (org_id, key)
);

create table public.user_preferences (
  user_id uuid not null references public.profiles (id) on delete cascade,
  org_id uuid not null references public.organisations (id) on delete cascade,
  key text not null,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, org_id, key)
);

create table public.terms_versions (
  version text primary key,
  published_at timestamptz not null default now(),
  is_material boolean not null default false,
  content_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.terms_acceptances (
  user_id uuid not null references public.profiles (id) on delete cascade,
  version text not null references public.terms_versions (version),
  accepted_at timestamptz not null default now(),
  ip_address inet,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, version)
);

-- Keep updated_at current on every table.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'organisations', 'profiles', 'organisation_members', 'cost_profiles',
    'org_settings', 'user_preferences', 'terms_versions', 'terms_acceptances'
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

-- A new auth user always gets a profile.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Organisation locks are enforced here, not only in the interface.
create trigger enforce_locks_on_user_preferences
  before insert or update on public.user_preferences
  for each row execute function public.enforce_org_locks();
