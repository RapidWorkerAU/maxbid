import { Inngest, eventType, staticSchema } from 'inngest';

// The Inngest client and the events the pipeline sends.
// Chosen in decision record 0013. Stages follow docs/02-specs/pipeline.md.
//
// staticSchema gives the events TypeScript types without pulling in a
// validation library. The data crossing these events is ours, written by one
// stage and read by the next, so it needs typing rather than validating.
//
// The event key and signing key are read from the environment. Neither is
// needed locally, because the Inngest Dev Server runs without them.

/** S1. A user submitted a catalogue URL or a PDF. */
export const analysisSubmitted = eventType('analysis/submitted', {
  schema: staticSchema<{
    analysisId: string;
    auctionId: string;
    sourceType: 'url' | 'pdf';
  }>(),
});

/** S2. The auction record exists and the catalogue needs fetching. */
export const extractRequested = eventType('analysis/extract.requested', {
  schema: staticSchema<{
    analysisId: string;
    auctionId: string;
  }>(),
});

/** S4. The lots are in the database and each needs identifying. */
export const triageRequested = eventType('analysis/triage.requested', {
  schema: staticSchema<{
    analysisId: string;
    auctionId: string;
    orgId: string;
  }>(),
});

/** S5. Every lot is identified and needs a rough resale range. */
export const valueRequested = eventType('analysis/value.requested', {
  schema: staticSchema<{
    analysisId: string;
    orgId: string;
  }>(),
});

export const inngest = new Inngest({ id: 'maxbid' });
