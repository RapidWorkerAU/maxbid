# Bid calculation

The bid maths is fixed, versioned and lives only in packages/calc. This page is the source of truth for it. It was checked against the live calculator in workbook tab 10, which is now a historical record under decision record 0007.

Names for the three figures come from decision record 0002. Rounding comes from decision record 0003. The return on cost, cash and GST credit formulas come from decision record 0004.

## The three bid figures

| Figure | What it is | Driven by |
| --- | --- | --- |
| Target bid | The highest bid that still meets the target profit. Shown to the user as the most you should bid. | Target profit |
| Limit bid | The highest bid that still meets the minimum acceptable profit. | Minimum acceptable profit |
| Break even bid | The bid at which estimated profit is zero. Any bid above it loses money. The marker yellow stop line marks this price on screen. | A profit of zero |

The three rise in that order. The break even bid is always the highest of them, so the limit bid is not the highest figure on the screen. Explain each term where it first appears, as WR03 requires.

## Inputs

1. Resale price for the chosen scenario, usually the conservative resale.
2. Whether the resale price includes GST.
3. The buyer's premium schedule, and whether GST applies to the hammer price and the premium.
4. Other costs: transport, removal, repairs, parts, testing, cleaning, storage, selling fees and other. Entered including GST.
5. Whether the buyer is registered for GST.
6. Target profit and minimum acceptable profit, in dollars or as a return on cost.

Where repairs are set as a percentage, the percentage applies to the resale price the bid is calculated from, taken as the GST inclusive figure, and the result is treated as a cost entered including GST. See decision record 0005.

## Notation

Throughout this page, g is the GST rate of 0.1, H is the hammer bid, C is the other costs as the user entered them, and P(H) is the buyer's premium at that hammer price. Where a band charges a percentage, p is that percentage, and k is the cost per dollar of hammer price within that band.

## Steps in words

1. If the buyer is registered for GST and the resale price includes GST, divide the resale price by 1.1. This is the net resale.
2. If the buyer is registered for GST and the other costs include GST, divide them by 1.1. These are the effective other costs.
3. Work out the budget: net resale less effective other costs less the profit being aimed at.
4. Find the highest hammer price whose total cost is within that budget, using the premium schedule. The section below says how.
5. The target bid uses the target profit, the limit bid uses the minimum acceptable profit, and the break even bid uses a profit of zero.
6. No bid limit is ever less than zero.

## The buyer's premium schedule

An auction states its buyer's premium as a schedule of bands. Each band covers
a range of hammer prices and charges either a fixed number of dollars or a
percentage. An auction that charges one percentage at every price is a
schedule holding a single band, so nothing here is a special case.

This is what the Grays Perth motor vehicle sale states, and it is the example
used below.

| Hammer price | Buyer's premium |
| --- | --- |
| $0 to $2,000 | $495 |
| $2,001 to $5,000 | $650 |
| $5,001 to $10,000 | $710 |
| $10,001 to $30,000 | 7 percent |
| $30,001 to $40,000 | 6 percent |
| $40,001 and above | 5 percent |

### Finding the highest bid within a budget

Inside a single band the cost of a lot is a straight line, so the highest bid
is one division. Across bands it is not, and it does not always rise with the
hammer price. Both of these are true of the schedule above.

1. **The cost can jump up.** A $2,000 hammer carries a $495 premium. A $2,001
   hammer carries $650. One more dollar of hammer price costs $156 more.
2. **The cost can fall.** A $10,000 hammer carries a fixed $710. A $10,001
   hammer carries 7 percent, which is $700.07. One more dollar of hammer price
   costs $8.93 less, so a $10,000 bid is a price nobody should ever make.

So the highest bid is found by taking each band in turn.

1. Solve that band's straight line for the budget. For a band charging a fixed
   amount F, the bid is the budget less the effective other costs less F,
   divided by the cost of a dollar of hammer price. For a band charging a
   percentage p, the bid is the budget less the effective other costs, divided
   by k.
2. Hold the answer to the band it was worked out for. An answer below the band
   does not belong to it. An answer above the band becomes the band's own top
   edge, because that is the most that band can offer.
3. Keep the answer only if the real cost at that price, worked out from the
   whole schedule, is within the budget.
4. The highest surviving answer is the bid.

Because every band is tried, both cases above come out right without being
handled separately. A budget that reaches a $10,000 hammer also reaches
$10,009, and step 4 returns the higher one.

## Profit targets set as a return on cost

A target may be a return on cost rather than a dollar amount. For a return r:

A profit of r times the cost means the resale has to cover the cost plus that profit, so the cost may be at most the net resale divided by (1 + r). That is a budget, so it goes through the same band walking as every other bid figure.

This produces the target bid when r is the target return, and the limit bid when r is the minimum acceptable return. The break even bid does not change, because a return of zero is the same as a profit of zero.

## Position at a chosen bid

These figures drive the calculator panel and the bid slider readout, and answer F32.

1. **Cash needed on the day.** H multiplied by (1 + g where GST applies to the hammer price), plus P(H) multiplied by (1 + g where GST applies to the premium), plus C.
2. **GST credits.** For GST registered buyers only, and zero for everyone else. H multiplied by g where GST applies to the hammer price, plus P(H) multiplied by g where GST applies to the premium, plus C less C divided by 1.1 where the costs were entered including GST.
3. **Cost after GST credits.** Cash needed on the day less the GST credits.
4. **Estimated profit.** Net resale less the cost after GST credits.
5. **Return on cost.** Estimated profit divided by the cost after GST credits.

Cash needed on the day uses the costs as entered, not the effective costs, because that is the money that actually leaves the buyer's account before any credit is claimed.

## Rounding

1. Every calculation runs unrounded, in cents, from end to end.
2. The three bid figures are rounded down to the nearest whole dollar whenever they are shown or exported. A bid figure is never rounded up.
3. Every other money figure rounds to the nearest dollar for display. The calculator detail may show cents where the design system allows it.
4. Rounding applies to the displayed figure only. Stored values keep their cents.

## Worked examples 1 and 2, a GST registered buyer (must pass as a test)

A GST registered buyer, resale $18,500 including GST, premium 16.5 percent with GST on the hammer and the premium, other costs $3,930 including GST, target profit $4,000 and minimum acceptable profit $1,500.

| Result | Unrounded | Shown to the user |
| --- | --- | --- |
| Target bid | $7,936.01 | $7,936 |
| Limit bid | $10,081.94 | $10,081 |
| Break even bid | $11,369.49 | $11,369 |

At the target bid of $7,936.01 the position is:

| Result | Value |
| --- | --- |
| Cash needed on the day | $14,100.00 |
| GST credits | $1,281.82 |
| Cost after GST credits | $12,818.18 |
| Estimated profit | $4,000.00 |
| Return on cost | 31.2 percent |

The rounded column shows the limit bid at $10,081 rather than $10,082, which is the rounding rule doing its job.

## Worked example 3, a buyer who is not registered for GST (must pass as a test)

The same lot and the same costs as worked example 1, bought by someone who is not registered for GST. They cannot claim the GST back, so the GST on the hammer price and on the premium becomes a real cost to them and lands in k, which rises from 1.165 to 1.2815. They also do not net the GST off the resale price or off their costs.

| Result | Unrounded | Shown to the user |
| --- | --- | --- |
| Target bid | $8,248.15 | $8,248 |
| Limit bid | $10,198.99 | $10,198 |
| Break even bid | $11,369.49 | $11,369 |

At the target bid of $8,248.15 the position is:

| Result | Value |
| --- | --- |
| Cash needed on the day | $14,500.00 |
| GST credits | $0.00 |
| Cost after GST credits | $14,500.00 |
| Estimated profit | $4,000.00 |
| Return on cost | 27.6 percent |

Two things are worth noting. The break even bid is the same $11,369.49 for both buyers, because the GST scales the resale, the costs and k by the same 1.1 and cancels out. The unregistered buyer reaches the same $4,000 profit, but needs $400 more cash on the day and earns a lower return on cost, because their money is tied up in GST they never get back.

## Worked example 4, a premium charged as a fixed amount (must pass as a test)

A GST registered buyer at the Grays vehicle sale whose schedule appears above.
Conservative resale $9,500 including GST, other costs $1,200 including GST,
GST applies to the hammer price and to the premium, target profit $2,000 and
minimum acceptable profit $750.

1. Net resale is 9,500 divided by 1.1, which is **$8,636.36**.
2. Effective other costs are 1,200 divided by 1.1, which is **$1,090.91**.
3. For the target bid the budget is 8,636.36 less 1,090.91 less 2,000, which
   is **$5,545.45**.
4. That budget lands in the $2,001 to $5,000 band, where the premium is a
   fixed $650. The bid is 5,545.45 less 650, which is **$4,895.45**, and
   $4,895.45 does sit inside that band.
5. The limit bid uses $750 instead, giving a budget of $6,795.45. That reaches
   the $5,001 to $10,000 band, where the premium is a fixed $710, so the bid
   is **$6,085.45**.
6. The break even bid uses a profit of zero, giving **$6,835.45**.

Shown to the user, rounded down: a target bid of **$4,895**, a limit bid of
**$6,085** and a break even bid of **$6,835**.

Note what the fixed premium does. The whole $650 comes off the bid, not a
percentage of it. A single rate of 16.5 percent would have advised $4,760,
which is $135 lower, and on a cheaper lot the gap is far wider.

## Where these examples are tested

All four worked examples are tested in packages/calc, and the tests fail if any figure on this page changes.

| Example | Test file |
| --- | --- |
| 1, the three bid figures | packages/calc/src/bidLimits.test.ts |
| 2 and 3, the position at a bid | packages/calc/src/position.test.ts |
| 4, a premium charged as a fixed amount | packages/calc/src/premiumBidLimits.test.ts |
| The premium schedule itself | packages/calc/src/premium.test.ts |
| The figures shown to the user | packages/calc/src/rounding.test.ts |
