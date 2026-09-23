// Pure tests, which run as part of pnpm check.
//
// Anything named *.db.test.ts needs a running database, so it is excluded here
// and runs through pnpm test:rls instead. See vitest.db.config.ts.

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'db-unit',
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**', 'src/**/*.db.test.ts'],
  },
});
