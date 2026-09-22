import { render, screen } from '@testing-library/react';
import { AA_NORMAL_TEXT, colors, contrast, onNavy } from '@maxbid/tokens';
import { describe, expect, it } from 'vitest';
import { DetailLabel } from './DetailLabel';

describe('DetailLabel', () => {
  it('is real text, because it names the card it sits on', () => {
    render(<DetailLabel>Detail A</DetailLabel>);
    expect(screen.getByText('Detail A')).toBeTruthy();
  });

  it('is a navy tab on a light card', () => {
    const { container } = render(<DetailLabel>Detail A</DetailLabel>);
    expect(container.firstElementChild?.className).toContain('bg-navy');
  });

  it('switches to a cyan outline inside a navy panel', () => {
    const { container } = render(<DetailLabel tone="onNavy">Detail A</DetailLabel>);
    expect(container.firstElementChild?.className).toContain('text-line');
  });

  it('reads at AA in both tones', () => {
    expect(contrast(onNavy.ink, colors.navy)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrast(onNavy.line, colors.navy)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });
});
