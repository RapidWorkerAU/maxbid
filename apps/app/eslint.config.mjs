import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { sizeRules } from "@maxbid/config/eslint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // FS01 and FS03. Defined once in packages/config.
  { rules: sizeRules },
  // FS02. A page holds routing, metadata and data loading, nothing more.
  {
    files: ["src/app/**/page.tsx", "src/app/**/layout.tsx"],
    rules: { "max-lines": ["error", { max: 80, skipBlankLines: true, skipComments: true }] },
  },
]);

export default eslintConfig;
