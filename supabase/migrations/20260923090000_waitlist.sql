-- The pre launch waitlist. Source: docs/02-specs/database.md.
--
-- F78 says sign ups are stored with their source. The table is written by the
-- server only, never from the browser, so there is no insert policy: the site
-- inserts through a server action using the secret key.

create extension if not exists citext;

create table public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  source text,
  utm jsonb,
  founding_eligible boolean not null default true,
  converted_org_id uuid references public.organisations (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.waitlist_signups
  for each row execute function public.set_updated_at();

-- Denied to everyone by default. No policy is added, so the anon and
-- authenticated roles can neither read nor write. An email address somebody
-- gave us before launch is not public, and nothing in the product needs to
-- read this list back.
alter table public.waitlist_signups enable row level security;
