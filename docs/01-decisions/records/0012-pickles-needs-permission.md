# 0012 Pickles is removed from V1 until they permit access

Status: Proposed
Date: 23 September 2026
Decided by: Ashleigh Phillips

## Context

Open item O05 asked us to read the Grays, Pickles and Lloyds terms of use and record any restrictions on automated access. Doing so turned up a problem with Pickles that changes V1 scope.

**Pickles prohibits it in two places.**

Their robots.txt disallows the exact paths an extractor needs: lot detail pages across cars, trucks, general goods and damaged salvage, auction listings, catalogues, and their own buyer facing APIs.

Their Online User Terms and Conditions, clause 9(b)(vi), say a user must not:

> scrape, harvest, copy or exploit Platform data except as expressly permitted by Pickles

D45 commits us to respecting site terms, and the legal specification is explicit: stop and seek permission where terms prohibit automated access. This is that case. It is not a grey area, an ambiguity, or something a better extractor solves.

D04 put Grays, Pickles and Lloyds in V1. F08 makes the Pickles extractor a Must in Phase 1. Both were written before anyone read the terms.

R02, an auction site blocking automated access, is rated 12. This is that risk arriving, before a line of extractor code was written.

## Options considered

1. **Build it anyway.** Rejected. It breaches D45, the legal specification and the terms themselves. It also risks the whole product: a cease and desist against a platform whose entire premise is reading auction catalogues is not a survivable outcome, and R08 already rates a terms breach at impact 5.
2. **Use the PDF upload path for Pickles.** A user downloads a Pickles catalogue and uploads it. Weaker, because it is manual, and it does not clearly avoid the problem: the terms restrict exploiting Platform data, not only the method of getting it. Worth asking a lawyer about, not assuming.
3. **Ask Pickles for permission.** The clause says except as expressly permitted by Pickles, so permission is the intended route. D45 already contemplates formal partnerships once there is traction.
4. **Drop Pickles from V1 and carry on with Grays and Lloyds.** Two of three sources still ship, and the internal MVP can prove the product without the third.

## Decision

**Options 3 and 4 together.** Pickles comes out of V1. We ask them for permission, and if they grant it, Pickles returns.

1. F08, the Pickles extractor, moves from Phase 1 Must to Phase 2, conditional on written permission.
2. D04 is amended. V1 sources are Grays and Lloyds, plus PDF upload.
3. Ashleigh approaches Pickles for permission. Until anything is in writing, nothing points at their site.
4. The PDF upload question in option 2 goes to the lawyer at O10, rather than being assumed either way.

## Consequences

1. docs/01-decisions/decision-register.md amends D04.
2. docs/02-specs/features.md moves F08 to Phase 2 and notes the condition.
3. docs/04-build/build-plan.md drops W3.1, the Pickles extractor, from Week 3.
4. docs/06-risk/risks-and-open-items.md records R02 as materialised for Pickles, and O05 as closed by docs/02-specs/site-access.md.
5. Grays is cleared. Ashleigh read the terms page in a browser on 23 September 2026 and found no clause on robots, scraping, automated access or extraction. A keyword search is not a legal review, so O10 rechecks it before public launch.
