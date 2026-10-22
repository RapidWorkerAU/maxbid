-- Row level security for valuation attempts.
-- Source: docs/02-specs/security-and-rls.md. O19.

alter table public.valuation_attempts enable row level security;

-- Readable by any signed in user, like the valuation it stands in for. F59
-- shows the working, and that we looked and found too little is part of the
-- working rather than something to hide.
--
-- No write policy. Only the background jobs record an attempt: a user saying
-- we tried would not make it true, and a user saying we did not would erase a
-- reason their figures are blank.
create policy valuation_attempts_select on public.valuation_attempts
  for select to authenticated using (true);
