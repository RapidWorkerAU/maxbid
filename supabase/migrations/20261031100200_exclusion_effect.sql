-- What setting a comparable aside did to the figures. F62, DS17.
--
-- F62 asks for the valuation before and after an exclusion, and once the
-- figures have moved there is nothing left on the row that remembers where
-- they moved from. The shared valuation is not it: an organisation that also
-- corrected the identification has an override for that reason too, so the
-- shared figure would be the wrong "before" and the sentence would be wrong
-- in exactly the case the reader most wants explained.
--
-- One column rather than three, because this is one fact: what their own
-- judgement about the evidence did to the answer. It is written by the
-- recompute stage and read by the lot screen.

alter table public.analysis_lots
  add column if not exists exclusion_effect jsonb;

comment on column public.analysis_lots.exclusion_effect is
  'F62. {excluded, before, after} where before and after are the expected resale with every comparable counted and with the ones this analysis set aside left out. Null where nothing is set aside. After is null where the remaining evidence no longer meets the threshold.';
