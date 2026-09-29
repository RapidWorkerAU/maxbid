# 0018. Web search is Brave Search

Status: Accepted

Date: 29 September 2026

Closes open item O03.

## Context

S5 gives each lot a rough resale range from one search pass. D35 said "a
dedicated search API such as Brave or SerpAPI" and left the choice open, and
O03 has blocked Week 3 since the workbook.

S5 runs once per lot, so the cost per query is multiplied by the size of every
catalogue. [unit-costs.md](../../02-specs/unit-costs.md) budgets $0.02 a lot
for the whole of triage. S4 now measures at $0.00087 a lot against a real sale,
so the search call has most of that budget to itself, but not an unlimited
amount of it.

## Decision

Brave Search.

## Why

1. **Flat per query pricing** suits a per query budget. A catalogue's search
   cost can be worked out before it runs rather than after.
2. **A free tier** means the fit can be tested against real lots before any
   money is committed.
3. **An independent index**, so the results do not depend on a second party's
   terms of service for access to a third party's results.

## What this gives up

SerpAPI returns Google results, and Google's coverage of Australian listing
sites is likely better. Comparables drive every valuation, so coverage is the
thing that matters most. This choice bets that an independent index is good
enough for a rough triage range, which is all S5 produces. The deep analysis
stages can use a different source, because they run on a handful of chosen
lots rather than on all of them.

## Consequences

1. S5 calls search through a small interface of our own, so swapping the
   provider is a day rather than a rewrite. The measurements below are the
   thing that would trigger a swap.
2. Every search call is written to `usage_events` with its cost, the same way
   every AI call is written to `ai_runs`. What S5 costs per lot is then a
   measured figure.
3. How often a search returns no usable Australian comparable is counted. If
   that number is high, this record is revisited with evidence rather than
   with an opinion.
4. An account and an API key are needed before S5 can run.
