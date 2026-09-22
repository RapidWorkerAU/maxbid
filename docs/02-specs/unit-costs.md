# Unit Costs and Economics

All cost inputs are estimates in AUD. Replace them with logged actuals from ai_runs and usage_events during the MVP.

Source: MaxBid Project Workbook, tab 19 Unit Economics. Copied into this document by decision record 0007.

## Inputs

| Input | Value | Note |
| --- | --- | --- |
| Lots per catalogue | 300 | Typical large Grays catalogue. |
| Extraction cost per catalogue | $1.50 | Estimate. Managed extraction service. |
| Triage cost per lot | $0.02 | Estimate. Small model plus one search call. |
| Deep analysis cost per lot | $0.60 | Estimate. Vision, several searches, page fetches and grading. |
| Shortlist rate | 0.10 | Share of lots users send to deep analysis. |
| Infrastructure overhead per catalogue | $0.50 | Estimate. Hosting, storage, email and jobs. |
| Organisations sharing each catalogue | 2 | Extraction and triage identification run once per auction and are shared. Set this to 1 for the worst case. |

## Cost per catalogue

| Line | Value |
| --- | --- |
| Triage cost, shared across organisations | $3.00 |
| Lots deep analysed | 30 |
| Deep analysis cost | $18.00 |
| Total cost per catalogue | $22.25 |
| Cost per deep credit, deep analysis only | $0.60 |

The triage side of a catalogue costs $4.25 for one organisation: $0.75 of shared extraction, $3.00 of shared triage and $0.50 of infrastructure.

## Tier margin at full usage

| Tier | Price ($) | Triage cost ($) | Deep cost ($) | Total cost ($) | Gross margin |
| --- | --- | --- | --- | --- | --- |
| Free | 0 | 4.25 | 3.00 | 7.25 | Acquisition cost |
| Starter | 79 | 21.25 | 24.00 | 45.25 | 0.43 |
| Pro | 199 | 51.00 | 60.00 | 111.00 | 0.44 |
| Dealer | 699 | 170.00 | 240.00 | 410.00 | 0.41 |

Full usage is the worst case. Most subscribers use well below their allowance. The free tier is a marketing cost and shows a negative margin by design.

## How this is used

The pricing rule in docs/02-specs/commercial.md tests every tier against this model. The price per credit must stay well above the deep analysis cost per lot, and every tier must hold at least 30 percent gross margin at full usage. F42 records the real AI, search and extraction cost per job so these estimates can be replaced with measured figures during the MVP.
