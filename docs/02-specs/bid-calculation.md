# Bid calculation

The bid maths is fixed, versioned and lives only in packages/calc. This page explains it. The workbook tab 10 holds a live calculator that proves it.

## Inputs

1. Resale price for the chosen scenario, usually the conservative resale.
2. Whether the resale price includes GST.
3. Buyer's premium rate, and whether GST applies to the hammer price and the premium.
4. Other costs: transport, removal, repairs, parts, testing, cleaning, storage, selling fees and other. Entered including GST.
5. Whether the buyer is registered for GST.
6. Target profit and minimum acceptable profit, in dollars or as a return on cost.

## Steps in words

1. If the buyer is registered for GST and the resale price includes GST, divide the resale price by 1.1. This is the net resale.
2. If the buyer is registered for GST and the other costs include GST, divide them by 1.1. These are the effective other costs.
3. Work out the cost of each dollar of hammer price. For a registered buyer this is 1 plus the premium rate. For an unregistered buyer it also includes the GST on the hammer and on the premium.
4. Target bid equals net resale, less effective other costs, less target profit, divided by the cost per hammer dollar.
5. Absolute maximum uses the minimum acceptable profit instead of the target profit.
6. Break even, also called the stop line, uses a profit of zero.
7. No bid limit is ever less than zero.

## Worked example (must pass as a test)

A GST registered buyer, resale $18,500 including GST, premium 16.5 percent with GST on hammer and premium, other costs $3,930 including GST, target profit $4,000 and minimum profit $1,500.

| Result | Value |
| --- | --- |
| Target bid | $7,936.01 |
| Absolute maximum | $10,081.94 |
| Break even | $11,369.49 |

These values are tested in packages/calc/src/bidLimits.test.ts.
