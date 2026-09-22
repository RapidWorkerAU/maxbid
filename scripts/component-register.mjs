// Reads docs/04-build/component-register.md, which is the source of truth for
// component status. Storybook and the tag check both read it through here, so
// the register is never retyped and cannot drift.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const REGISTER_PATH = fileURLToPath(
  new URL('../docs/04-build/component-register.md', import.meta.url),
);

/** Register status, and the story tag that must carry it. */
export const STATUS_TAGS = {
  'Not started': null,
  Draft: 'draft',
  'In review': 'in-review',
  Approved: 'approved',
  'Changes requested': 'changes-requested',
};

export const TAG_VALUES = Object.values(STATUS_TAGS).filter(Boolean);

/** Every UI row in the register, in the order the document lists them. */
export function readRegister(path = REGISTER_PATH) {
  const rows = [];
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    if (!/^\|\s*UI\d+\s*\|/.test(line)) continue;
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    const [id, component, layer, usedIn, status, date, notes] = cells;
    rows.push({ id, component, layer, usedIn, status, date: date || '', notes: notes || '' });
  }
  return rows;
}
