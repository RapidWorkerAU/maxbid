-- Row level security for the credit ledger.
-- Source: docs/02-specs/security-and-rls.md. F17.

alter table public.credit_ledger enable row level security;

-- An organisation reads its own movements. F17 shows the credits a shortlist
-- will cost before confirming it, and a balance nobody can see is a balance
-- nobody can plan against.
create policy credit_ledger_select on public.credit_ledger
  for select using (public.is_org_member(org_id));

-- No insert, update or delete policy, for anybody.
--
-- Credits a user could grant themselves would not be credits. Everything that
-- writes here is a grant we made, a reserve the pipeline took, or a refund it
-- gave back, and all of those go through the service role.
--
-- Append only is enforced the same way: there is no update or delete policy,
-- so even the organisation that owns a row cannot change what happened.
