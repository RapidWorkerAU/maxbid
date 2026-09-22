# 0007 The documents replace the workbook as the source of truth

Status: Accepted
Date: 22 September 2026
Decided by: Ashleigh Phillips

## Context

docs/README.md ranked the workbook last in the order of authority, yet several specifications pointed at it for the values that matter. CS01 gave the bid formulas as tab 10, CS04 to CS11 gave the weights and thresholds as tab 08, and F27 required the calculator to match tab 10 to the cent.

The workbook is an .xlsx file. It cannot be read in a pull request, a change to it produces no reviewable difference, and two tabs it was trusted for, 19 and 21, had no document at all. A source of truth that cannot be reviewed is not one.

## Options considered

1. Keep the workbook authoritative for formulas and weights. Every calculator review then depends on opening a spreadsheet by hand.
2. Move everything still needed into the documents and retire the workbook to a historical record.

## Decision

Once this pull request merges, the documents in docs are the only source of truth. The workbook in docs/workbook becomes a historical record of the discovery session. It is kept because it shows where the decisions came from, and it is never cited as authority again.

Tab 19 Unit Economics becomes docs/02-specs/unit-costs.md. Tab 21 Naming becomes the name candidates section of docs/03-design/brand-and-writing.md. Both are copied without change.

Where a document says Source: MaxBid Project Workbook, tab NN, that line stays. It records where the content came from and no longer means the workbook decides.

## Consequences

1. docs/README.md drops the workbook from the order of authority and says plainly that it is a historical record.
2. docs/README.md corrects the contents table, which listed the success metrics under 06-risk when they are in docs/04-build/roadmap.md.
3. docs/02-specs/commercial.md, D42 and R17 point at the new documents instead of at tab numbers.
4. Any future change to a formula, weight or threshold is a change to a document plus a decision record. Nobody edits the spreadsheet.
