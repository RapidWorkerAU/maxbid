// Tests that need a running database.
//
// Started by pnpm test:rls, which fills in the connection details from
// supabase status. CI runs these on every pull request.

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'database',
    include: ['src/**/*.db.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 60_000,
    // Each file creates its own organisations and users, but they share one
    // database, so they run one at a time to keep failures readable.
    fileParallelism: false,
  },
});
