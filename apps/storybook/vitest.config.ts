// Runs every story as a test in a real browser.
//
// The Storybook Vitest addon turns each story into a test case, and the
// accessibility addon's annotations run axe against it. preview.ts sets
// a11y.test to error, so a violation fails the build. C10 asks for axe and
// contrast checks in CI, and contrast needs real computed styles.
//
// This config lives beside .storybook rather than in packages/ui because the
// addon roots the project here, and Vitest resolves its browser dependencies
// from the project root.

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { componentRegisterPlugin } from '../../scripts/register-vite-plugin.mjs';

const configDir = fileURLToPath(new URL('./.storybook', import.meta.url));
const setupFile = fileURLToPath(new URL('./vitest.setup.ts', import.meta.url));

export default defineConfig({
  plugins: [storybookTest({ configDir }), componentRegisterPlugin()],
  test: {
    name: 'stories',
    setupFiles: [setupFile],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
});
