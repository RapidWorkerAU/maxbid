// Fails the build when a code file breaks the MaxBid file size rules (workbook tab 39).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const HARD_CAP = 300;
const TARGET = 150;
const PAGE_CAP = 80;
const CODE = /\.(ts|tsx|js|jsx|mjs|cjs|css)$/;
const SKIP_DIRS = new Set([
  'node_modules', '.next', '.turbo', '.git', '.vercel', 'dist', 'out', 'build',
  'coverage', 'storybook-static', 'playwright-report', 'test-results', 'supabase',
]);
const EXEMPT = [/database\.types\.ts$/, /\.d\.ts$/, /pnpm-lock\.yaml$/];

let failures = 0;
let warnings = 0;

function countLines(text) {
  return text.split(/\r?\n/).filter((line) => {
    const t = line.trim();
    return t && !t.startsWith('//') && !t.startsWith('/*') && !t.startsWith('*');
  }).length;
}

function check(path) {
  const rel = relative(ROOT, path).split(sep).join('/');
  const lines = countLines(readFileSync(path, 'utf8'));
  const isPage = /\/page\.(tsx|ts|jsx|js)$/.test(rel);
  const cap = isPage ? PAGE_CAP : HARD_CAP;
  if (lines > cap) {
    console.error(`FAIL  ${rel}  ${lines} lines, limit ${cap}`);
    failures += 1;
  } else if (!isPage && lines > TARGET) {
    console.warn(`WARN  ${rel}  ${lines} lines, target ${TARGET}`);
    warnings += 1;
  }
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (CODE.test(name) && !EXEMPT.some((r) => r.test(name))) check(path);
  }
}

walk(ROOT);
console.log(`File size check: ${failures} over the limit, ${warnings} over the target.`);
process.exit(failures > 0 ? 1 : 0);
