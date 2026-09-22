import { render, screen } from '@testing-library/react';
import { AA_NORMAL_TEXT, colors, contrast, onNavy } from '@maxbid/tokens';
import { describe, expect, it } from 'vitest';
import { SheetFrame } from './SheetFrame';

describe('SheetFrame', () => {
  it('renders what it is given', () => {
    render(
      <SheetFrame>
        <p>Most you should bid</p>
      </SheetFrame>,
    );
    expect(screen.getByText('Most you should bid')).toBeTruthy();
  });

  it('is a navy panel', () => {
    const { container } = render(<SheetFrame>Panel</SheetFrame>);
    expect(container.firstElementChild?.className).toContain('bg-navy');
  });

  it('draws a double frame, per detail B01', () => {
    const { container } = render(<SheetFrame>Panel</SheetFrame>);
    const frames = container.querySelectorAll('.border-border-on-navy');
    expect(frames.length).toBe(2);
  });

  it('reads at AA for both text colours on the navy panel', () => {
    expect(contrast(onNavy.ink, colors.navy)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrast(onNavy.inkMuted, colors.navy)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });
});
