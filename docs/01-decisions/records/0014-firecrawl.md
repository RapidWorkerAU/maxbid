# 0014 Firecrawl is the extraction service

Status: Accepted
Date: 23 September 2026
Decided by: Ashleigh Phillips

## Context

D34 chose "a managed service such as Firecrawl or Browserbase" without picking one, and open item O02 has held that choice open since the workbook. No extractor could be built until it was settled.

## Options considered

1. **Browserbase.** A cloud hosted Chrome you drive with Playwright. It fills forms, clicks buttons, handles sign in and keeps session state across steps. It bills per browser minute, so a slow page costs more than a fast one, and proxy bandwidth is metered separately.
2. **Firecrawl.** An extraction API. Give it a URL and it returns the rendered page as markdown. It bills per page, so a page that takes ten seconds costs the same as one that takes half a second.

## Decision

Firecrawl.

The deciding point is what we are allowed to do rather than what we could do. D45 and docs/02-specs/site-access.md limit us to public pages, rate limited, with no login bypass. We never fill a form, never sign in and never click through a flow, which is the entire capability Browserbase sells and Firecrawl lacks.

Per page billing also suits the model. docs/02-specs/unit-costs.md budgets $1.50 per catalogue for extraction, which is a fixed number of pages, not a fixed number of minutes. One published comparison measured Browserbase at 4.4 times the cost and 6.7 times slower for this kind of work.

## The risk this accepts

If a catalogue needs interaction to paginate, such as a Load more button that fetches the next page of lots, Firecrawl may not reach the later pages. We will not know until a real Grays or Lloyds catalogue is extracted in W2.4.

If that happens the answer is not to swap wholesale. The fetching is behind one module, `apps/app/src/extract/firecrawl.ts`, so a single site that needs a browser can use one without changing the rest.

## Consequences

1. `tech-stack.md` and D34 name Firecrawl rather than offering a choice.
2. `BROWSERBASE_API_KEY` and `BROWSERBASE_PROJECT_ID` leave `.env.example`.
3. O02 is closed.
4. The fetching module enforces the site access rules in one place: robots.txt read on every run, an honest user agent, a rate limit per host, and public pages only. An extractor cannot skip them by forgetting.
