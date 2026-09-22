import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MATCH_LABELS, MatchBadge } from './MatchBadge';

describe('MatchBadge', () => {
  it('covers the six match levels in the spec', () => {
    expect(Object.keys(MATCH_LABELS)).toHaveLength(6);
  });

  it('always shows the level as text, so shape and colour are never alone', () => {
    for (const [level, label] of Object.entries(MATCH_LABELS)) {
      const { unmount } = render(<MatchBadge level={level as 'exact'} />);
      expect(screen.getByText(label)).toBeTruthy();
      unmount();
    }
  });

  it('hides the glyph from screen readers, because the text carries it', () => {
    const { container } = render(<MatchBadge level="exact" />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it('shows the match weight to two places when it is given', () => {
    render(<MatchBadge level="nearExact" weight={0.85} />);
    expect(screen.getByText('0.85')).toBeTruthy();
  });

  it('leaves the weight out when it is not given', () => {
    render(<MatchBadge level="nearExact" />);
    expect(screen.queryByText('0.85')).toBeNull();
  });

  it('gives exact and near exact a solid fill, and the middle levels an outline', () => {
    const { container: exact } = render(<MatchBadge level="exact" />);
    expect(exact.firstElementChild?.className).toContain('bg-ink');
    const { container: spec } = render(<MatchBadge level="higherSpec" />);
    expect(spec.firstElementChild?.className).toContain('border');
  });
});
