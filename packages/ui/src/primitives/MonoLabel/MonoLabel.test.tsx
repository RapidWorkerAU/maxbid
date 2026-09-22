import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MonoLabel } from './MonoLabel';

describe('MonoLabel', () => {
  it('uses Space Mono with wide letter spacing, per B04', () => {
    render(<MonoLabel>Most you should bid</MonoLabel>);
    const label = screen.getByText('Most you should bid');
    expect(label.className).toContain('font-mono');
    expect(label.className).toContain('tracking-widest');
  });

  it('is uppercased by CSS, so the readable text stays in sentence case', () => {
    // A screen reader reads the text content, not the rendered case, so the
    // label must not be shouted in the markup.
    render(<MonoLabel>Most you should bid</MonoLabel>);
    expect(screen.getByText('Most you should bid').className).toContain('uppercase');
  });

  it('turns line cyan on navy panels', () => {
    render(<MonoLabel tone="onNavy">Break even bid</MonoLabel>);
    expect(screen.getByText('Break even bid').className).toContain('text-line');
  });
});
