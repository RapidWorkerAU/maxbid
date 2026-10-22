-- Let a user read the evidence behind a shared identification.
-- Decision record 0024, and F59.
--
-- owns_identification was written when every identification belonged to an
-- analysis, and it asks owns_analysis whether the caller owns that analysis.
-- Decision record 0024 made the baseline identification shared, with a null
-- analysis, and owns_analysis(null) is false. So lot_comparables_select denied
-- every row hanging off a baseline, which since that record is every
-- identification the pipeline writes.
--
-- The effect was that the evidence panel would be empty on every lot, with the
-- range above it built from comparables the reader was not allowed to see.
-- That is the opposite of F59, which exists so a figure can be checked.
--
-- This matches lot_identifications_select, which already reads "analysis_id is
-- null or owns_analysis(analysis_id)". A reader who may see the identification
-- may see the evidence behind it.

create or replace function public.owns_identification(target_identification uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.lot_identifications i
    where i.id = target_identification
      -- A null analysis is the shared baseline every organisation reads.
      and (i.analysis_id is null or public.owns_analysis(i.analysis_id))
  );
$$;

-- can_edit_identification is deliberately not changed. Excluding a comparable
-- from the shared baseline would change what every other organisation sees,
-- and nobody may write the baseline. A user who wants to exclude a comparable
-- corrects the identification first, which gives them their own, and F62 then
-- applies to that.
