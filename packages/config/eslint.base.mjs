// Shared lint rules for every workspace. The line limits are defined here and
// nowhere else. Source: docs/04-build/architecture.md, FS01 to FS06.

import js from '@eslint/js';
import tseslint from 'typescript-eslint';

/** FS06. Generated database types and declaration files are the only exemptions. */
export const exemptions = [
  '**/database.types.ts',
  '**/*.d.ts',
  '**/dist/**',
  '**/.next/**',
  '**/storybook-static/**',
];

/**
 * FS01 and FS03. Blank lines and comments do not count, so these agree with
 * scripts/check-file-size.mjs. The script is the wider net: it also covers
 * CSS, SQL and any file ESLint does not lint.
 */
export const sizeRules = {
  'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
  'max-lines-per-function': ['error', { max: 80, skipBlankLines: true, skipComments: true }],
};

/** The base every package uses. Apps add their Next config on top of this. */
export const base = [
  { ignores: exemptions },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      ...sizeRules,
      // Unused arguments are fine when they are there to document a signature.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Tests describe many cases in one block, so the function cap does not help.
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.stories.tsx'],
    rules: { 'max-lines-per-function': 'off' },
  },
];

export default base;
