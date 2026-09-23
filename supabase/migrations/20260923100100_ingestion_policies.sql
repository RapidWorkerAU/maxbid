-- Row level security for the ingestion tables.
-- Source: docs/02-specs/security-and-rls.md.

-- analysis_lots carries no org_id. It belongs to an organisation through its
-- analysis, so the check goes one hop. SECURITY DEFINER for the same reason as
-- the membership helpers: the policy would otherwise read a table it guards.
create or replace function public.owns_analysis(target_analysis uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.analyses a
    where a.id = target_analysis
      and public.is_org_member(a.org_id)
  );
$$;

create or replace function public.can_edit_analysis(target_analysis uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.analyses a
    where a.id = target_analysis
      and public.can_edit_org(a.org_id)
  );
$$;

alter table public.auction_platforms enable row level security;
alter table public.auctions enable row level security;
alter table public.raw_extract enable row level security;
alter table public.lots enable row level security;
alter table public.lot_images enable row level security;
alter table public.analyses enable row level security;
alter table public.analysis_lots enable row level security;

-- Shared tables. Any signed in user reads them. Only the service role writes,
-- through the background jobs, so there is no insert, update or delete policy.
create policy auction_platforms_select on public.auction_platforms
  for select to authenticated using (true);

create policy auctions_select on public.auctions
  for select to authenticated using (true);

create policy lots_select on public.lots
  for select to authenticated using (true);

create policy lot_images_select on public.lot_images
  for select to authenticated using (true);

-- raw_extract gets no policy at all. A raw payload holds third party content,
-- which D44 keeps out of the product, and nothing in the interface reads it.

-- Analyses belong to one organisation. A viewer reads, a buyer or above
-- creates and changes.
create policy analyses_select on public.analyses
  for select using (public.is_org_member(org_id));

create policy analyses_insert on public.analyses
  for insert with check (public.can_edit_org(org_id) and created_by = auth.uid());

create policy analyses_update on public.analyses
  for update using (public.can_edit_org(org_id)) with check (public.can_edit_org(org_id));

create policy analyses_delete on public.analyses
  for delete using (public.is_org_admin(org_id));

-- Analysis lots follow their analysis.
create policy analysis_lots_select on public.analysis_lots
  for select using (public.owns_analysis(analysis_id));

create policy analysis_lots_insert on public.analysis_lots
  for insert with check (public.can_edit_analysis(analysis_id));

create policy analysis_lots_update on public.analysis_lots
  for update using (public.can_edit_analysis(analysis_id))
  with check (public.can_edit_analysis(analysis_id));

create policy analysis_lots_delete on public.analysis_lots
  for delete using (public.can_edit_analysis(analysis_id));
