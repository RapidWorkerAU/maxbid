// Component logic tests in jsdom, which is fast.
//
// Every story is tested separately, in a real browser, by apps/storybook.
// Accessibility and colour contrast need real computed styles, and jsdom has
// none, so those checks live there rather than here.

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'unit',
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    globals: true,
  },
});
