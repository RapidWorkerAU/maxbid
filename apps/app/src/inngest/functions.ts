// Every pipeline function Inngest may run. Stages are added here as they are
// built, in the order docs/02-specs/pipeline.md lists them.

import { extract } from './extract';
import { ingest } from './ingest';

export const functions = [ingest, extract];
