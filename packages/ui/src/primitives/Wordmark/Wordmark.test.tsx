import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Wordmark } from './Wordmark';

describe('Wordmark', () => {
  it('is read as one name, MaxBid, rather than as two words', () => {
    render(<Wordmark />);
    expect(screen.getByRole('img', { name: 'MaxBid' })).toBeTruthy();
  });

  it('hides the letters from screen readers so the name is not read twice', () => {
    const { container } = render(<Wordmark />);
    const hidden = container.querySelectorAll('[aria-hidden="true"]');
    expect(hidden.length).toBeGreaterThanOrEqual(2);
  });

  it('turns white on navy panels', () => {
    const { rerender } = render(<Wordmark />);
    expect(screen.getByRole('img').className).toContain('text-ink');
    rerender(<Wordmark onNavy />);
    expect(screen.getByRole('img').className).toContain('text-ink-on-navy');
  });

  it('offers three sizes for the header, the footer and the hero', () => {
    for (const [size, expected] of [
      ['sm', 'text-xl'],
      ['md', 'text-3xl'],
      ['lg', 'text-5xl'],
    ] as const) {
      const { unmount } = render(<Wordmark size={size} />);
      expect(screen.getByRole('img').className).toContain(expected);
      unmount();
    }
  });
});
