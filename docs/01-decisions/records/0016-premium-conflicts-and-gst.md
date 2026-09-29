# 0016. Which premium text governs, and whether it includes GST

Status: Accepted

Date: 29 September 2026

## Context

Decision record 0015 modelled the buyer's premium as a schedule. Reading the
lot pages to write the parser turned up two things that record did not settle.
Both were checked on two lots at opposite ends of the same sale, lot 0001 and
lot 0037, and both pages say the same thing.

### One page states two different premiums

The **Overview** panel, which is Grays' own structured field for the lot,
carries a table:

| Final bid price | Buyers premium |
| --- | --- |
| $0 - $2,000 | $495 |
| $2,001 - $5,000 | $650 |
| $5,001 - $10,000 | $710 |
| $10,001 - $30,000 | 7% |
| $30,001 - $40,000 | 6% |
| $40,001+ | 5% |

These are the figures decision record 0015 was built on, and they are on the
page word for word.

The **Description** field, lower down the same page, states something else
entirely, and states it identically on both lots, so it is boilerplate:

> Buyer's Premium Standard Car: $0 - $5,000 = $550 (inc GST), $5,001 - $65,000
> = $715 (inc GST) + 1.65% (inc GST), Above $65,001 = 2.75% (inc GST).
> Buyer's Premium Prestige Car: $0 - $26,000 = $1,100 minimum (inc GST), Above
> $26,001 = 4.4% (inc GST).

On lot 0001, whose current bid is $1,609, the Overview table says the premium
is **$495** and the Description says **$550**. They disagree by $55 on a lot
worth about sixteen hundred dollars.

The Description also uses two shapes the schedule cannot currently express:

1. A band that charges a fixed amount **and** a percentage: $715 plus 1.65 per
   cent.
2. A band that charges a **minimum**: $1,100 minimum.

### The stated premium includes GST, and the calculator assumes it does not

Both lot pages carry this note:

> GST will not be added to, or included in, the final bid price of this item.
> GST is included in the buyers premium.

[bid-calculation.md](../../02-specs/bid-calculation.md) works the other way. It
takes the premium as a figure before GST and adds GST where it applies, as
"the premium multiplied by (1 + g where GST applies to the premium)".

So storing $495 with GST marked as applying would charge the buyer $544.50,
which is **$49.50 more than the auction charges**. Storing it with GST marked
as not applying charges the right $495, but then a GST registered buyer is
never credited the **$45** of GST that is inside that $495, and every figure
that depends on the credit is wrong in their favour.

Neither of the two states we have is correct for this auction. What is missing
is a third: an amount that already includes GST.

## Options

### A. Which text governs

1. **The Overview table.** It is Grays' own structured field for that lot,
   while the Description is vendor supplied free text repeated across lots.
   Parse the table, keep the Description in `raw_terms`, and show the user
   both when they disagree.
2. **The Description.** Treat the longer text as the real terms because it
   names vehicle classes and is more specific.
3. **Refuse to guess.** Where the two disagree, store no premium, fall back to
   the platform default and show DS12. Correct and cautious, and it would fire
   on every lot of this sale, so every lot in it would carry a fallback.

### B. GST inside the premium

1. **Record whether an amount includes GST**, per schedule. Where it does, the
   premium is charged as stated and a registered buyer is credited the GST
   inside it, which is the amount less the amount divided by 1.1. This is
   another change to `packages/calc` and to the spec.
2. **Keep two states and mark GST as not applying.** The buyer is charged the
   right amount today, and a registered buyer quietly loses a credit they are
   entitled to. On this sale that is $45 a lot.
3. **Store the premium exclusive of GST**, by dividing the stated figure by
   1.1 on the way in, and let the existing maths add it back. The arithmetic
   comes out right. The stored figure then matches nothing the auction
   published, so a user checking $450 against the $495 on the page would
   reasonably think we had it wrong.

## Decision

**A1. The Overview table governs.** It is Grays' own structured field for the
lot. The Description is vendor supplied free text, repeated word for word on
both lots checked, which is how boilerplate behaves. The Description is kept
in `raw_terms`, and where the two disagree the user is shown both, because
the money at stake is theirs and the page is public.

**B1. A schedule records whether its amounts include GST.** Where it does, the
buyer is charged the published figure and a registered buyer is credited the
GST inside it. This is the only option that gets both numbers right.

## Consequences

Done:

1. `PremiumSchedule` gains `includesGst`. `premiumChargedAt` and
   `premiumGstAt` in `packages/calc` hold the three cases, and the multiplier
   on each dollar of stated premium is 1 divided by 1.1 for a registered buyer
   on such a schedule.
2. [bid-calculation.md](../../02-specs/bid-calculation.md) has a section on it.
3. The database guard refuses an `includesGst` that is not a plain true or
   false, because the string "false" reads as true everywhere it is used.

Still to do:

4. S3 parses the Overview table, keeps the Description in `raw_terms`, and
   records that the two disagree so the user can be shown both.
5. The schedule still cannot express a band charging a fixed amount **and** a
   percentage, or a band with a minimum. The Description uses both. Nothing we
   parse needs them yet, and inventing them before a schedule we trust uses
   them would be guessing. Recorded as open item O18.
