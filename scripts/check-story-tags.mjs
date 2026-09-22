// Enforces rule 4 of docs/04-build/component-register.md: the status tag in
// each story file must match the register. Nothing enforced this before, so
// the register and the stories could disagree silently.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { STATUS_TAGS, TAG_VALUES, readRegister } from './component-register.mjs';

const ROOT = process.cwd();
const UI_SRC = join(ROOT, 'packages', 'ui', 'src');
const SKIP_DIRS = new Set(['node_modules', 'dist', '.turbo']);

let failures = 0;

function fail(message) {
  console.error(`FAIL  ${message}`);
  failures += 1;
}

function findStories(dir, found = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) findStories(path, found);
    else if (name.endsWith('.stories.tsx')) found.push(path);
  }
  return found;
}

/** Reads the status tags out of a story file's meta tags array. */
function tagsIn(source) {
  const block = source.match(/tags\s*:\s*\[([^\]]*)\]/);
  if (!block) return [];
  return [...block[1].matchAll(/['"]([^'"]+)['"]/g)]
    .map((m) => m[1])
    .filter((tag) => TAG_VALUES.includes(tag));
}

// The register writes some names as words, such as Toggle group, while the
// file has to be a valid identifier, ToggleGroup. Compare them without case
// or spaces so the two can never drift apart over a space.
const key = (name) => name.toLowerCase().replace(/\s+/g, '');

const register = readRegister();
const byComponent = new Map(register.map((row) => [key(row.component), row]));
const stories = findStories(UI_SRC);
const seen = new Set();

for (const path of stories) {
  const rel = relative(ROOT, path).split(sep).join('/');
  const component = path.split(sep).at(-1).replace('.stories.tsx', '');
  const row = byComponent.get(key(component));

  if (!row) {
    fail(`${rel} has no row in the component register. Add it before building it.`);
    continue;
  }
  seen.add(key(component));

  const expected = STATUS_TAGS[row.status];
  const found = tagsIn(readFileSync(path, 'utf8'));

  if (expected === null) {
    fail(`${rel} exists but ${row.id} ${component} is Not started in the register.`);
  } else if (found.length === 0) {
    fail(`${rel} has no status tag. The register says ${row.status}, so add tags: ['${expected}'].`);
  } else if (found.length > 1) {
    fail(`${rel} carries more than one status tag: ${found.join(', ')}.`);
  } else if (found[0] !== expected) {
    fail(`${rel} is tagged ${found[0]} but the register says ${row.status} (${expected}).`);
  }
}

// A component cannot be past Not started without a story to review.
for (const row of register) {
  if (row.status !== 'Not started' && !seen.has(key(row.component))) {
    fail(`${row.id} ${row.component} is ${row.status} in the register but has no story file.`);
  }
}

console.log(
  `Story tag check: ${stories.length} stories against ${register.length} register rows, ${failures} problems.`,
);
process.exit(failures > 0 ? 1 : 0);
