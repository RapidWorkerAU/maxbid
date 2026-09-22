import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Money, formatMoney } from './Money';

describe('formatMoney', () => {
  it('formats Australian dollars with no cents by default', () => {
    expect(formatMoney({ amount: 7936.01 })).toBe('$7,936');
  });

  it('shows cents only when asked, for the calculator detail', () => {
    expect(formatMoney({ amount: 7936.01, showCents: true })).toBe('$7,936.01');
  });

  it('rounds a bid figure down, never up', () => {
    // Decision record 0003. $10,081.94 must not become $10,082.
    expect(formatMoney({ amount: 10081.94, rounding: 'down' })).toBe('$10,081');
    expect(formatMoney({ amount: 10081.94 })).toBe('$10,082');
  });

  it('rounds the three worked example figures the way the spec shows them', () => {
    const down = (amount: number) => formatMoney({ amount, rounding: 'down' });
    expect(down(7936.01)).toBe('$7,936');
    expect(down(10081.94)).toBe('$10,081');
    expect(down(11369.49)).toBe('$11,369');
  });

  it('shows a negative with a minus sign on screen', () => {
    expect(formatMoney({ amount: -1240 })).toBe('-$1,240');
  });

  it('replaces the minus sign with parentheses in exports', () => {
    expect(formatMoney({ amount: -1240, forExport: true })).toBe('($1,240)');
  });
});

describe('Money', () => {
  it('uses tabular figures so columns line up', () => {
    const { container } = render(<Money amount={7936.01} />);
    expect(container.firstElementChild?.className).toContain('tabular-nums');
  });

  it('shows a negative figure in red', () => {
    const { container } = render(<Money amount={-1240} />);
    expect(container.firstElementChild?.className).toContain('text-zone-red');
  });

  it('renders a hero figure at 48px for the phone bid view', () => {
    const { container } = render(<Money amount={7936} size="hero" />);
    expect(container.firstElementChild?.className).toContain('text-5xl');
  });

  it('puts the figure on the page as text a reader can find', () => {
    render(<Money amount={7936.01} rounding="down" />);
    expect(screen.getByText('$7,936')).toBeTruthy();
  });
});
