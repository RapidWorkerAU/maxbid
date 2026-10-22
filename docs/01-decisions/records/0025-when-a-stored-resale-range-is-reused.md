# 0025. When a stored resale range is reused

Status: Accepted

Date: 22 October 2026

## Context

Decision record 0024 moves resale ranges onto the lot so they are worked out
once and read by everybody. That only saves anything if a stored range is
actually handed over instead of being worked out again.

Valuing one lot costs a web search, a model call and up to four page fetches,
against a shared limit of eight fetches a minute. That is why a 36 lot sale
took about forty minutes, almost all of it in the valuation stage.

Decision record 0024 says a resale range a week old is fine without setting a
rule, so the rule is set here.

## What can make a stored range wrong

Two things, and they are not equally detectable.

| | Can we detect it? |
| --- | --- |
| Our valuation method changed | **Yes.** It is our own code, and a version string records it |
| The market moved | No. We would be guessing from the age of the figure |

## Decision

A stored range is reused while the method version that produced it matches the
method version running now, whatever its age.

`VALUATION_METHOD_VERSION` in `apps/app/src/inngest/sharedValuation.ts` is that
string. **It must be changed whenever the method changes what the answer would
be**: the evidence weights in decision record 0020, the minimum evidence rule,
the asking discount, or how comparables are gathered and graded. A range made
by any other version is ignored, the lot is valued again, and the new range
supersedes the old one.

Four options were put to Ashleigh. The other three were an age limit of thirty
days, an age limit of seven days, and always re-valuing with the stored range
kept only as evidence.

## Why not an age limit

1. **The error we measured was not staleness.** On the Grays Perth sale of 29
   September 2026, two lots were estimated at 2.8 and 3.5 times what they
   fetched, on the day they were valued. Almost every comparable was an
   advertised price weighted 0.6, against 0.95 for a sold price. Age had
   nothing to do with it.
2. **Resale values on vehicles and machinery move over quarters.** We have no
   evidence they move meaningfully inside a month, so a thirty day limit would
   be a number we could not defend.
3. **A seven day limit gives back most of the saving.** A sale crawled on
   Monday would be valued again the following Monday whether or not anybody
   looked at it, so the nightly crawl would pay twice for the same stock.
4. **The method version is the honest trigger.** When accuracy improves it will
   be because the method or the evidence changed, and bumping the version
   re-values everything at once. That is also how the fix gets rolled out.

## What this costs

The risk is a forgotten version bump: a method is improved, the string is left
alone, and stored ranges made by the old method keep being handed over. Nothing
detects that. It is written into the comment on the constant, into the build
plan, and into this record, and that is the whole mitigation. An age limit would
have capped the damage at thirty days, which is the real argument against this
decision and was put to Ashleigh as option B.

## Consequences

1. S5 reads the stored ranges for a whole shortlist in one query before
   spending anything, and only values the lots it holds nothing for.
2. A lot we already hold a range for does not use up a shortlist place, so a
   sale read last night shows every lot rather than the top thirty.
3. The confidence score is stored with the range. Until now there was nowhere
   to keep it, so every valued lot counted as medium and the ranking could not
   tell a well evidenced lot from a thin one.
4. A lot that failed the evidence threshold stores nothing, so it is valued
   again on every analysis. Raised as O19.
