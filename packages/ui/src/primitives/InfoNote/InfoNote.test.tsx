import { render, screen } from '@testing-library/react';
import { DS02, DS15 } from '@maxbid/content';
import { describe, expect, it } from 'vitest';
import { InfoNote } from './InfoNote';

describe('InfoNote', () => {
  it('shows a message taken from packages/content', () => {
    render(<InfoNote>{DS15}</InfoNote>);
    expect(screen.getByText(DS15)).toBeTruthy();
  });

  it('is muted 12px text, per PR01', () => {
    const { container } = render(<InfoNote>{DS15}</InfoNote>);
    const note = container.firstElementChild;
    expect(note?.className).toContain('text-xs');
    expect(note?.className).toContain('text-ink-muted');
  });

  it('turns amber for a warning, per PR02', () => {
    const { container } = render(<InfoNote tone="warning">{DS15}</InfoNote>);
    expect(container.firstElementChild?.className).toContain('text-zone-amber');
  });

  it('hides the icon from screen readers, because the words carry the note', () => {
    const { container } = render(<InfoNote>{DS15}</InfoNote>);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('opens the full text without any client code when one is given', () => {
    const { container } = render(<InfoNote fullText={DS02}>Estimate only.</InfoNote>);
    // details and summary, so the note works before JavaScript loads.
    expect(container.querySelector('details')).toBeTruthy();
    expect(container.querySelector('summary')).toBeTruthy();
    expect(screen.getByText(DS02)).toBeTruthy();
  });

  it('is a plain paragraph when there is nothing to expand', () => {
    const { container } = render(<InfoNote>{DS15}</InfoNote>);
    expect(container.querySelector('details')).toBeNull();
    expect(container.querySelector('p')).toBeTruthy();
  });
});
