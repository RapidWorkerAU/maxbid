# 0004 Calculator formulas for return on cost, cash and GST credits

Status: Accepted
Date: 22 September 2026
Decided by: Ashleigh Phillips

## Context

docs/02-specs/bid-calculation.md documented the dollar profit case only. Three things it did not document were already required elsewhere.

1. A profit target set as a return on cost. D19, F28, CS28 and docs/02-specs/cost-fields.md all allow it, and the database stores target_return_pct and min_return_pct.
2. The cash a buyer needs on the day, and the effective cost after GST credits. F32 makes both a Must and SC08 puts them on the calculator panel.
3. The estimated profit and return at a chosen bid, which the bid slider readout needs.

Workbook tab 10 already models all three. Without them written down, packages/calc held a bidForReturn function with no spec behind it and no test.

## Options considered

1. Leave them undocumented and read the spreadsheet each time. The formulas then live in a file that cannot be reviewed in a pull request.
2. Write them into docs/02-specs/bid-calculation.md with a worked example that must pass as a test.

## Decision

The formulas below join the bid maths and are hard coded under CS01. Throughout, g is the GST rate of 0.1, p is the buyer's premium rate, H is the hammer bid, C is the other costs as the user entered them, and k is the cost per dollar of hammer price.

1. **Return on cost target r.** H = max(0, (net resale less effective other costs multiplied by (1 + r)) divided by (k multiplied by (1 + r))). This gives the target bid when r is the target return, and the limit bid when r is the minimum acceptable return.
2. **Cash needed on the day.** H multiplied by (1 + g where GST applies to the hammer price), plus H multiplied by p multiplied by (1 + g where GST applies to the premium), plus C.
3. **GST credits.** For GST registered buyers only. H multiplied by g where GST applies to the hammer price, plus H multiplied by p multiplied by g where GST applies to the premium, plus C less C divided by 1.1 where the costs were entered including GST.
4. **Cost after GST credits.** Cash needed on the day less the GST credits.
5. **Estimated profit.** Net resale less the cost after GST credits. Return on cost is that profit divided by the cost after GST credits.

## Consequences

1. docs/02-specs/bid-calculation.md carries all five formulas and a second worked example at a hammer bid of $7,936.01: cash needed $14,100.00, GST credits $1,281.82, cost after credits $12,818.18, estimated profit $4,000.00 and a return on cost of 31.2 percent. These figures reconcile with workbook tab 10.
2. packages/calc implements them with tests covering the worked example and the unregistered buyer case. This lands in the calculator pull request.
3. F32 in docs/02-specs/features.md now has a formula to test against.
