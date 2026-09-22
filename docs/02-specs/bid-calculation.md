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
3. Buyer's premium rate, and whether GST applies to the hammer price and the premium.
4. Other costs: transport, removal, repairs, parts, testing, cleaning, storage, selling fees and other. Entered including GST.
5. Whether the buyer is registered for GST.
6. Target profit and minimum acceptable profit, in dollars or as a return on cost.

Where repairs are set as a percentage, the percentage applies to the resale price the bid is calculated from, taken as the GST inclusive figure, and the result is treated as a cost entered including GST. See decision record 0005.

## Notation

Throughout this page, g is the GST rate of 0.1, p is the buyer's premium rate, H is the hammer bid, C is the other costs as the user entered them, and k is the cost per dollar of hammer price.

## Steps in words

1. If the buyer is registered for GST and the resale price includes GST, divide the resale price by 1.1. This is the net resale.
2. If the buyer is registered for GST and the other costs include GST, divide them by 1.1. These are the effective other costs.
3. Work out k, the cost of each dollar of hammer price. For a registered buyer this is 1 plus the premium rate, because the GST is claimed back. For an unregistered buyer it also includes the GST on the hammer and on the premium.
4. The target bid equals net resale, less effective other costs, less the target profit, divided by k.
5. The limit bid uses the minimum acceptable profit instead of the target profit.
6. The break even bid uses a profit of zero.
7. No bid limit is ever less than zero.

## Profit targets set as a return on cost

A target may be a return on cost rather than a dollar amount. For a return r:

H = max(0, (net resale less effective other costs multiplied by (1 + r)) divided by (k multiplied by (1 + r)))

This produces the target bid when r is the target return, and the limit bid when r is the minimum acceptable return. The break even bid does not change, because a return of zero is the same as a profit of zero.

## Position at a chosen bid

These figures drive the calculator panel and the bid slider readout, and answer F32.

1. **Cash needed on the day.** H multiplied by (1 + g where GST applies to the hammer price), plus H multiplied by p multiplied by (1 + g where GST applies to the premium), plus C.
2. **GST credits.** For GST registered buyers only, and zero for everyone else. H multiplied by g where GST applies to the hammer price, plus H multiplied by p multiplied by g where GST applies to the premium, plus C less C divided by 1.1 where the costs were entered including GST.
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

## Where these examples are tested

All three worked examples are tested in packages/calc, and the tests fail if any figure on this page changes.

| Example | Test file |
| --- | --- |
| 1, the three bid figures | packages/calc/src/bidLimits.test.ts |
| 2 and 3, the position at a bid | packages/calc/src/position.test.ts |
| The figures shown to the user | packages/calc/src/rounding.test.ts |
