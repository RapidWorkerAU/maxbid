import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LINE_ICON_NAMES, LineIcon } from './LineIcon';

describe('LineIcon', () => {
  it('is hidden from screen readers when the control beside it has the words', () => {
    const { container } = render(<LineIcon name="download" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('role')).toBeNull();
  });

  it('takes a name when it stands alone', () => {
    render(<LineIcon name="external" label="Opens in a new tab" />);
    expect(screen.getByRole('img', { name: 'Opens in a new tab' })).toBeTruthy();
  });

  it('draws at the 1.4px stroke weight in detail B07', () => {
    const { container } = render(<LineIcon name="search" />);
    expect(container.querySelector('svg')?.getAttribute('stroke-width')).toBe('1.4');
  });

  it('is pen blue by default', () => {
    const { container } = render(<LineIcon name="search" />);
    expect(container.querySelector('svg')?.getAttribute('class')).toContain('text-link');
  });

  it('draws a path for every name it offers', () => {
    for (const name of LINE_ICON_NAMES) {
      const { container, unmount } = render(<LineIcon name={name} />);
      const path = container.querySelector('path')?.getAttribute('d');
      expect(path, `${name} has no path`).toBeTruthy();
      unmount();
    }
  });
});
