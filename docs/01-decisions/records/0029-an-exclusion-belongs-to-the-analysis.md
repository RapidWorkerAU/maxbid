# 0029. An exclusion belongs to the analysis, not to the evidence

Status: Accepted

Date: 31 October 2026

## Context

F62 says a user may exclude a comparable, that the exclusion requires a
reason, and that the valuation is shown before and after.

The database already had somewhere to put that: `lot_comparables` carries an
`excluded_by_user` flag and an `excluded_reason`. Writing there is the obvious
implementation and it is the wrong one, for two reasons that only became
visible once decision record 0024 split what is shared from what is one
organisation's own.

1. **`lot_comparables` is shared.** It hangs off an identification, and a
   baseline identification is read by every organisation looking at that sale.
   An exclusion written there would set the comparable aside for everybody. One
   organisation deciding a listing is not the same thing does not make it so
   for the rest of them.
2. **Nobody may write it.** `can_edit_identification` returns false for a
   baseline identification, because nothing with a user's hand in it belongs on
   a row that everybody reads. So F62 as originally designed could not be
   performed at all: the user had no row they were allowed to touch.

## Decision

An exclusion is its own row in `comparable_exclusions`, keyed by the analysis
and the `lot_comparables` row it names, carrying the reason and who gave it.

1. **The analysis owns it.** Row level security answers with
   `owns_analysis` and `can_edit_analysis`, so a viewer may read an exclusion
   and not make one, and another organisation sees nothing.
2. **It may be inserted and deleted, never updated.** Changing their mind is
   putting the comparable back, which is a delete. An update policy would let
   the reason be rewritten after the fact, and the reason is the record of why
   a figure moved.
3. **The figures it produces are theirs.** The recompute stage writes
   `triage_low` and `triage_high` on their own `analysis_lots` row, the same
   place a corrected identification writes to, and leaves the shared valuation
   alone. Decision record 0024.
4. **The comparable stays on the screen.** It is shown marked, carrying their
   words, with the weight it no longer counts for removed. Hiding it would
   leave the figures changed and the reason for the change nowhere on the
   page, and they could never put it back.

## What the recompute costs

Nothing. The comparables are the ones we already found, so the stage reads the
evidence back out of the tables, rebuilds it from the stored price, match level
and dates, and weighs it twice: once with everything and once with the ones
they set aside marked excluded. No search, no model call and no page fetches.

Rebuilt from the stored facts rather than from the stored weight, because a
weight read back is a figure from a method version we may no longer be
running.

## Showing the before and after

`analysis_lots.exclusion_effect` holds `{excluded, before, after}`, where both
figures are the expected resale. One column, because it is one fact: what
their own judgement about the evidence did to the answer.

It is stored rather than worked out on the screen. The shared valuation looked
like a free "before", and it is not: an organisation that also corrected the
identification has an override for that reason too, so the shared figure would
be the wrong "before" in exactly the case the reader most wants explained.

DS17 is the wording. Filled with a 1 the stock sentence reads "You excluded 1
comparables", so `exclusionNote` in `@maxbid/content` makes the number agree.
The words stay DS17's own and the agreement is grammar rather than new copy,
which is why it lives with the message instead of in a component.

## When their own exclusion leaves too little

The figures go. `configuration.md` says a lot with every comparable excluded
moves to insufficient evidence until one is restored or a resale is entered,
and that is what happens: the maximum bid and both ends of the range are
cleared, and the resale panel says there is not enough evidence to put a
figure on the lot.

That is not a failure. It is true, and it is what their own judgement made
true. Leaving a figure on screen that we would no longer stand behind would
be the failure.

## Consequences

1. `lot_comparables.excluded_by_user` is now dead for this purpose. The
   shaping code still honours it, so a row the pipeline itself rejects stays
   out of the panel, but nothing writes it from the product.
2. An exclusion is per analysis, so the same user analysing the same sale twice
   judges the evidence twice. That is correct: the second analysis may be for a
   different purpose, and a judgement about what is comparable is not a
   standing setting.
3. The recompute stage is the only Inngest function with no network in it,
   which is why it keeps a concurrency key per lot and a single retry.
