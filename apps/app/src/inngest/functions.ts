// Every pipeline function Inngest may run. Stages are added here as they are
// built, in the order docs/02-specs/pipeline.md lists them.

import { extract } from './extract';
import { ingest } from './ingest';
import { harvestResults } from './harvestFunction';
import { triage } from './triageFunction';

export const functions = [ingest, extract, triage, harvestResults];
