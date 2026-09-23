import { serve } from 'inngest/next';
import { inngest } from '../../../inngest/client';
import { functions } from '../../../inngest/ingest';

// The endpoint Inngest calls to run our functions.
//
// The middleware lets this path through, because Inngest authenticates with
// its signing key rather than a session cookie. That exception lives in
// packages/db/src/access.ts, where it is tested.
//
// The signing key is read from INNGEST_SIGNING_KEY. Without one the SDK runs
// in development mode against the Dev Server.

export const { GET, POST, PUT } = serve({ client: inngest, functions });
