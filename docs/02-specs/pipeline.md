# Processing Pipeline

Each stage is an Inngest or Trigger.dev function. Lots fan out as independent steps.

Source: MaxBid Project Workbook, tab 12 Pipeline.

| Stage | Name | Trigger | Work performed | AI usage | Writes to | Typical duration |
| --- | --- | --- | --- | --- | --- | --- |
| S1 | Ingest | User submits URL or PDF | Detect platform, create auction and analysis records, check triage allowance | None | auction, analysis | Seconds |
| S2 | Extract | S1 complete | Fetch catalogue pages or parse PDF. Paginate. Store raw payload. | Claude for PDF structuring only | raw_extract | 1 to 5 min |
| S3 | Normalise | S2 complete | Map to lot records. Download primary photo references. Parse premium and GST terms. | Claude for premium terms parsing | lot, lot_image, premium rule | Under 1 min |
| S4 | Triage identify | Per lot | Classify category and product type from text and primary photo. | Small model (Claude Haiku class) | lot_identification (triage) | Parallel |
| S5 | Triage value | Per lot | One search pass plus internal history lookup. Rough resale range. | Small model to read results | triage_valuation | Parallel |
| S6 | Rank and notify | All lots complete | Rough max bid with the selected cost profile, opportunity score, email user. | None | Updated lots, notification | Seconds |
| S7 | Shortlist | User confirms selection | Reserve credits in ledger, queue deep jobs. | None | credit_ledger entries | Seconds |
| S8 | Deep identify | Per shortlisted lot | Read all photos including plates. Extract brand, model, year, specs, condition notes. | Large model (Claude Sonnet class) with vision | lot_identification (deep) | Parallel |
| S8A | Enrich | S8 complete and item identified | Search manufacturer, dealer and specification sources for the identified model. Build field list with source class. Detect conflicts with the auctioneer description and photos. | Large model to read and reconcile specification pages | lot_spec_fields, product_spec_sources | Parallel |
| S9 | Comparable search | S8A complete | Query eBay, search API, internal history and auction results. Fetch candidate pages. | Small model to generate queries | comparable, comparable_snapshot | Parallel |
| S10 | Match grading | S9 complete | Assign match level, reason, differences and price adjustment to each comparable. | Large model | lot_comparable | Parallel |
| S11 | Valuation | S10 complete | Apply weights, compute scenarios and confidence score. | None (deterministic code) | valuation | Seconds |
| S12 | Costs and bids | S11 complete | Apply cost profile, transport estimate and GST to compute bid limits. | None (deterministic code) | lot_costs | Seconds |
| S13 | Finalise | All shortlisted lots complete | Settle credits, notify user, log cost per job. | None | usage_event, notification | Seconds |
| S14 | Revalue on correction | User edits identification | Rerun S9 to S12 for that lot. Reuse cached comparables where valid. | As S9 and S10 | New valuation version | 1 to 2 min |
| S15 | Closing alerts | Scheduled | Find watchlisted lots closing within the user's window and send alerts. | None | notification | Every 5 min |
**Design rules.** AI is used for reading, identifying and grading. All money maths is deterministic code, never AI. Every AI output is stored with the model name, prompt version and cost so results are reproducible and auditable.

