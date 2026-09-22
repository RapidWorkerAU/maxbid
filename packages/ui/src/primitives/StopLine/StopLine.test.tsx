import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StopLine } from './StopLine';

describe('StopLine', () => {
  it('is hidden from screen readers when it is only decoration', () => {
    const { container } = render(<StopLine />);
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('carries a name when it marks something, such as the break even bid', () => {
    render(<StopLine label="Stop line at the break even bid of $11,369" />);
    expect(screen.getByRole('img', { name: /break even bid of \$11,369/ })).toBeTruthy();
  });

  it('is always marker yellow, because it is the stop line', () => {
    const { container } = render(<StopLine />);
    expect(container.firstElementChild?.className).toContain('bg-accent');
  });

  it('offers three thicknesses for its different jobs', () => {
    for (const [thickness, expected] of [
      ['thin', 'h-0.5'],
      ['regular', 'h-1'],
      ['thick', 'h-2'],
    ] as const) {
      const { container, unmount } = render(<StopLine thickness={thickness} />);
      expect(container.firstElementChild?.className).toContain(expected);
      unmount();
    }
  });
});
