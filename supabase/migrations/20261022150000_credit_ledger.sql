-- Credit movements. F17, and the credit rules in commercial.md.
--
-- One credit is one deep analysed lot. Credits are reserved when deep
-- analysis starts, settled on completion, and refunded automatically when a
-- lot fails, so a single lot can appear here three times.
--
-- Append only, and a balance is the sum of the rows rather than a number kept
-- anywhere. A stored balance and a ledger that disagree is a question with no
-- answer, and the one that would be wrong is the stored one, because the
-- ledger is what actually happened.

create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organisations (id) on delete cascade,
  -- Positive grants, negative uses. Never nought: a movement of nothing is
  -- not a movement, and a row that changes no balance is a row that only
  -- makes the ledger harder to read.
  delta integer not null check (delta <> 0),
  reason text not null check (
    reason in ('plan_grant', 'top_up', 'reserve', 'settle', 'refund', 'adjustment')
  ),
  -- The analysis a reserve belongs to, or the payment a top up came from.
  reference_id uuid,
  -- Plan credits roll over for one month and top up credits last twelve.
  --
  -- Recorded from the first row and not yet enforced. The balance below
  -- ignores it, because there are no credits anybody has paid for and a month
  -- is a long time to wait to test an expiry rule. Every row carries its own
  -- date so that turning it on later is a change to one function rather than
  -- a backfill of dates we would have to invent.
  expires_at timestamptz,
  -- Why, in words, for the rows a person created rather than the pipeline.
  note text,
  created_at timestamptz not null default now()
);

create index credit_ledger_org_idx on public.credit_ledger (org_id, created_at desc);

comment on table public.credit_ledger is
  'Append only credit movements. A balance is the sum of these rows and is never stored. F17.';
comment on column public.credit_ledger.expires_at is
  'When this grant stops counting. Recorded from the first row, not yet enforced by credits_available. commercial.md rollover rules.';

/**
 * What an organisation has left to spend.
 *
 * SECURITY DEFINER because the balance has to be the same number whoever
 * asks, and a policy that hid a row would quietly hand back a smaller one.
 *
 * Expiry is deliberately not applied yet. The column records it, this does
 * not read it, and the comment above says why.
 */
create or replace function public.credits_available(target_org uuid)
returns integer
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(sum(delta), 0)::integer
  from public.credit_ledger
  where org_id = target_org;
$$;

comment on function public.credits_available is
  'The sum of an organisation''s credit movements. Expiry is recorded on each row but not yet applied.';
