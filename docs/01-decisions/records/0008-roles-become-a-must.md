# 0008 Roles become a Must in Phase 1

Status: Accepted
Date: 22 September 2026
Decided by: Ashleigh Phillips

## Context

F03 Roles was priority Should in Phase 1, but other Phase 1 work already assumed roles existed.

1. F52 organisation setting locks is a Must and requires the database to reject a member's write. That rule is about who is writing.
2. docs/02-specs/security-and-rls.md defines the row level security policies in terms of owner, admin, buyer and viewer.
3. CS43 to CS55 in docs/02-specs/configuration.md all read Buyer or above.
4. The situation responses in the same document block a viewer from editing.

A Must feature cannot depend on a Should feature. If roles slipped, the locks and the security policies had nothing to test against.

## Options considered

1. Keep roles as Should and write the security policies without them. The policies would need rewriting the moment roles arrived.
2. Make roles a Must, which matches what the rest of Phase 1 already assumes.

## Decision

F03 Roles is a Must in Phase 1. Owner, admin, buyer and viewer are created in the first database migration, alongside organisations and members, so the row level security policies and the lock rules can be written and tested once.

## Consequences

1. F03 in docs/02-specs/features.md changes from Should to Must.
2. The first migration creates the role column and its policies, which pull request 6 of the Week 1 plan already covers.
3. No change to the roles themselves or to what each one may do.
