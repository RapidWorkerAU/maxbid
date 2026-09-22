-- Row level security. Source: docs/02-specs/security-and-rls.md.
--
-- Every table is denied by default and opened one policy at a time. R11, a
-- cross tenant data leak, is scored impact 5, so nothing here relies on the
-- interface behaving.

alter table public.organisations enable row level security;
alter table public.profiles enable row level security;
alter table public.organisation_members enable row level security;
alter table public.cost_profiles enable row level security;
alter table public.org_settings enable row level security;
alter table public.user_preferences enable row level security;
alter table public.terms_versions enable row level security;
alter table public.terms_acceptances enable row level security;

-- Organisations. Members read. Owners and admins rename. Creation goes
-- through create_organisation, so there is no insert policy.
create policy organisations_select on public.organisations
  for select using (public.is_org_member(id));

create policy organisations_update on public.organisations
  for update using (public.is_org_admin(id)) with check (public.is_org_admin(id));

-- Profiles. You read your own, and those of people you share an organisation
-- with, because D71 makes team activity visible inside the organisation.
create policy profiles_select on public.profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1
      from public.organisation_members mine
      join public.organisation_members theirs on theirs.org_id = mine.org_id
      where mine.user_id = auth.uid()
        and theirs.user_id = public.profiles.id
    )
  );

create policy profiles_update on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Memberships. Members see who else is in the organisation. Owners and admins
-- manage them.
create policy organisation_members_select on public.organisation_members
  for select using (public.is_org_member(org_id));

create policy organisation_members_insert on public.organisation_members
  for insert with check (public.is_org_admin(org_id));

create policy organisation_members_update on public.organisation_members
  for update using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));

create policy organisation_members_delete on public.organisation_members
  for delete using (public.is_org_admin(org_id));

-- Cost profiles. CS26 lets an owner, admin or buyer edit them. A viewer reads.
create policy cost_profiles_select on public.cost_profiles
  for select using (public.is_org_member(org_id));

create policy cost_profiles_insert on public.cost_profiles
  for insert with check (public.can_edit_org(org_id));

create policy cost_profiles_update on public.cost_profiles
  for update using (public.can_edit_org(org_id)) with check (public.can_edit_org(org_id));

create policy cost_profiles_delete on public.cost_profiles
  for delete using (public.can_edit_org(org_id));

-- Organisation settings and locks. Members read so the interface can show
-- what is locked. Only owners and admins write.
create policy org_settings_select on public.org_settings
  for select using (public.is_org_member(org_id));

create policy org_settings_insert on public.org_settings
  for insert with check (public.is_org_admin(org_id));

create policy org_settings_update on public.org_settings
  for update using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));

create policy org_settings_delete on public.org_settings
  for delete using (public.is_org_admin(org_id));

-- User preferences. Your own, inside an organisation you belong to. The lock
-- trigger decides whether the value itself is allowed.
create policy user_preferences_select on public.user_preferences
  for select using (user_id = auth.uid() and public.is_org_member(org_id));

create policy user_preferences_insert on public.user_preferences
  for insert with check (user_id = auth.uid() and public.is_org_member(org_id));

create policy user_preferences_update on public.user_preferences
  for update using (user_id = auth.uid() and public.is_org_member(org_id))
  with check (user_id = auth.uid() and public.is_org_member(org_id));

create policy user_preferences_delete on public.user_preferences
  for delete using (user_id = auth.uid() and public.is_org_member(org_id));

-- Terms. Any signed in user reads the versions. Writes are service role only.
create policy terms_versions_select on public.terms_versions
  for select to authenticated using (true);

-- Acceptances. You insert and read your own, and nobody else's.
create policy terms_acceptances_select on public.terms_acceptances
  for select using (user_id = auth.uid());

create policy terms_acceptances_insert on public.terms_acceptances
  for insert with check (user_id = auth.uid());
