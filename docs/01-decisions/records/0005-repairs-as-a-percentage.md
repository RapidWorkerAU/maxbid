# 0005 Repairs entered as a percentage of resale

Status: Accepted
Date: 22 September 2026
Decided by: Ashleigh Phillips

## Context

docs/02-specs/cost-fields.md allows repairs to be set as a percentage of resale, and cost_profiles stores repair_mode as dollars or percent_of_resale. Neither said which resale figure the percentage applies to, nor whether the result counts as a GST inclusive cost. Three resale scenarios exist, so the same percentage could produce three different repair costs.

## Options considered

1. Apply the percentage to the expected resale every time. The repair cost would then not move when the user switches scenario, which hides risk on the conservative view.
2. Apply it to the resale figure the bid is calculated from. The repair estimate moves with the scenario, which is what a user changing scenario expects to see.

## Decision

A repair percentage applies to the resale price the bid is calculated from, which is the selected scenario, taken as the GST inclusive figure. The result is treated as a cost entered including GST, exactly like every other cost line, so a registered buyer nets the GST off it.

Switching the resale scenario or overriding the resale price recalculates the repair estimate.

## Consequences

1. docs/02-specs/cost-fields.md records which resale figure is used and the GST treatment.
2. docs/02-specs/database.md notes the same against cost_profiles.repair_mode.
3. packages/calc resolves the repair amount before it totals the other costs. This lands in the calculator pull request.
