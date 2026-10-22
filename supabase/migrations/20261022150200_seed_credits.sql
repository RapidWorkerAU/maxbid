-- Credits for the organisations that exist while this is being built.
--
-- Nothing issues credits yet. Stripe is Week 8, and until then a balance of
-- nought would make the shortlist impossible to use, including by the person
-- building it.
--
-- So every organisation that exists now gets a grant, recorded in the ledger
-- like any other movement rather than set as a number somewhere. It says in
-- its own note what it is, so a ledger read in six months does not look like
-- somebody was given a thousand credits for nothing.
--
-- This is deliberately not a trigger on new organisations. A grant that
-- happens automatically for everybody who signs up is free credits for the
-- public, and that is a pricing decision rather than a migration.

insert into public.credit_ledger (org_id, delta, reason, note)
select
  id,
  1000,
  'adjustment',
  'Granted while the product was being built, so the shortlist could be used before billing existed.'
from public.organisations;
