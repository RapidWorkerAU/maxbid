# 0011 Keep the raw extraction payload in its own table

Status: Accepted
Date: 23 September 2026
Decided by: Ashleigh Phillips

## Context

Pipeline stage S2 in docs/02-specs/pipeline.md says it stores the raw payload in `raw_extract`. No such table exists in docs/02-specs/database.md. The `lots` table has a `raw jsonb` column described as the original extracted payload.

The two documents cannot both be right. Either S2 names a table the schema forgot, or `raw_extract` is a stale name for `lots.raw`.

## Options considered

1. **Use `lots.raw` only.** One less table. The payload is stored against each lot once parsing has produced lots.
2. **Add `raw_extract` as its own table.** The payload is stored as it arrives, before anything is parsed.

## Decision

`raw_extract` is a real table, and docs/02-specs/database.md gains it.

Three things decided this.

1. **The payload arrives before any lot exists.** S2 fetches catalogue pages and paginates. S3 is the stage that maps them to lot records. Storing the payload only on `lots` means there is nowhere to put it between those two stages.
2. **Extraction can fail halfway.** If parsing breaks on page seven of twelve, the first six pages should be replayable without fetching them again. Refetching costs money and puts load on an auction site we have promised in D45 to treat carefully.
3. **R01 is rated 12.** Auction sites changing their structure and breaking an extractor is one of the higher risks, and its mitigation names versioned extractors. Reprocessing an old payload under a new extractor version is only possible if the payload was kept as it arrived.

`lots.raw` stays. It holds the slice of the payload that produced that lot, which is what a person looking at one lot wants to see. The two serve different jobs.

## Consequences

1. docs/02-specs/database.md gains `raw_extract`: id, auction_id, source_url, page, payload, extractor_version and fetched_at.
2. The table is written by the service role only and has no read policy, because a raw payload holds third party content that D44 keeps out of the product. Nothing in the interface reads it.
3. docs/02-specs/database.md also gains a unique constraint on `analysis_lots` over analysis_id and lot_id, which the schema needed and did not state. One lot appears once in one analysis.
