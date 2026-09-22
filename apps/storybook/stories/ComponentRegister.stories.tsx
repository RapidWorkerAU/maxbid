// The component register, read from docs/04-build/component-register.md at
// build time. Nothing here is retyped, so this page cannot drift from the
// document that governs it.

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import register from 'virtual:component-register';

// Every status carries a text label, so colour is never the only signal.
// Not started uses ink_muted rather than confidence_insufficient, because
// that token does not reach 4.5 to 1 on the page background.
const STATUS_CLASS: Record<string, string> = {
  'Not started': 'text-ink-muted',
  Draft: 'text-ink-muted',
  'In review': 'text-zone-amber',
  Approved: 'text-zone-green',
  'Changes requested': 'text-zone-red',
};

const HEADINGS = ['ID', 'Component', 'Layer', 'Used in', 'Status', 'Date', 'Notes'];
const CELL = 'border-b border-surface-muted px-2 py-1.5 text-left align-top';

function summary() {
  const counts = new Map<string, number>();
  for (const row of register) counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
  return [...counts.entries()].map(([status, count]) => `${count} ${status.toLowerCase()}`).join(', ');
}

function Row({ row }: { row: (typeof register)[number] }) {
  return (
    <tr>
      <th scope="row" className={`${CELL} font-mono font-normal`}>
        {row.id}
      </th>
      <td className={CELL}>{row.component}</td>
      <td className={CELL}>{row.layer}</td>
      <td className={CELL}>{row.usedIn}</td>
      <td className={`${CELL} font-semibold ${STATUS_CLASS[row.status] ?? 'text-ink-muted'}`}>
        {row.status}
      </td>
      <td className={CELL}>{row.date}</td>
      <td className={CELL}>{row.notes}</td>
    </tr>
  );
}

function ComponentRegisterPage() {
  return (
    <main className="bg-page p-6 font-sans text-ink">
      <h1 className="text-3xl font-bold">Component register</h1>
      <p className="mt-2 max-w-3xl">
        This page lists every component in packages/ui and the status Ashleigh
        has given it. It is read from docs/04-build/component-register.md, so it
        always matches that document. Only a component marked Approved may be
        used in a page.
      </p>
      <p className="mt-2 mb-4 text-ink-muted">
        There are {register.length} components in the register: {summary()}.
      </p>
      <table className="w-full border-collapse text-sm">
        <caption className="pb-2 text-left text-ink-muted">
          Every component in packages/ui with its review status
        </caption>
        <thead>
          <tr>
            {HEADINGS.map((heading) => (
              <th key={heading} scope="col" className="border-b-2 border-line px-2 py-1.5 text-left">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {register.map((row) => (
            <Row key={row.id} row={row} />
          ))}
        </tbody>
      </table>
    </main>
  );
}

const meta: Meta<typeof ComponentRegisterPage> = {
  title: 'Overview/Component register',
  component: ComponentRegisterPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const Register: StoryObj<typeof ComponentRegisterPage> = {};
