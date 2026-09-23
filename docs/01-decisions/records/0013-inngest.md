# 0013 Inngest is the background job runner

Status: Accepted
Date: 23 September 2026
Decided by: Ashleigh Phillips

## Context

D32 chose "Inngest or Trigger.dev" without picking one, and open item O01 has held that choice open since the workbook. Nothing in the pipeline could be built until it was settled.

The pipeline is fan out shaped. D32 says durable, retryable, long running steps with fan out per lot. F11 says a failed lot must retry without restarting the catalogue. A 300 lot catalogue means 300 independent runs, and the unit costs model assumes about 330 runs per catalogue.

## Options considered

1. **Trigger.dev.** Open source and self hostable, so no vendor lock in, which is a real advantage. Its Hobby tier caps concurrency at 5, which cannot run a 300 lot fan out, so it means a paid tier from the first real catalogue.
2. **Inngest.** Event driven fan out is its primary abstraction rather than a feature. Its free tier covers roughly 150 catalogues a month at our run count, which is more than the internal MVP needs. Hosted only, so there is lock in.

## Decision

Inngest.

Fan out is the shape of this product, not a detail of it, and Inngest treats it as the main thing. The free tier covers the entire internal MVP, which matters while D01 says we build for ourselves first and keep early costs low.

The lock in is real and accepted. The pipeline stages are ordinary TypeScript functions calling ordinary code, so what would have to be rewritten is the orchestration, not the work.

## Consequences

1. `tech-stack.md` and D32 name Inngest rather than offering a choice.
2. `TRIGGER_SECRET_KEY` leaves `.env.example`.
3. O01 is closed.
4. Neither key is needed for local work, because the Inngest Dev Server runs without them. They are needed once something is deployed.
5. Confirm current pricing and limits before public launch, as `tech-stack.md` requires. The figures behind this decision came from comparison sites that disagreed with each other.
