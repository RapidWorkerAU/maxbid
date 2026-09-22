import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LeaderLine } from './LeaderLine';

describe('LeaderLine', () => {
  it('shows the label and the figure', () => {
    render(<LeaderLine label="Transport">$750</LeaderLine>);
    expect(screen.getByText('Transport')).toBeTruthy();
    expect(screen.getByText('$750')).toBeTruthy();
  });

  it('hides the dotted leader from screen readers', () => {
    const { container } = render(<LeaderLine label="Transport">$750</LeaderLine>);
    const leader = container.querySelector('[aria-hidden="true"]');
    expect(leader?.className).toContain('border-dotted');
  });

  it('uses tabular figures so a column of costs lines up', () => {
    const { container } = render(<LeaderLine label="Transport">$750</LeaderLine>);
    expect(container.textContent).toContain('$750');
    expect(container.querySelector('.tabular-nums')).toBeTruthy();
  });

  it('becomes a term and a definition inside a cost list', () => {
    const { container } = render(
      <dl>
        <LeaderLine inList label="Transport">
          $750
        </LeaderLine>
      </dl>,
    );
    expect(container.querySelector('dt')?.textContent).toBe('Transport');
    expect(container.querySelector('dd')?.textContent).toBe('$750');
  });

  it('stays plain spans outside a list, so the markup is never invalid', () => {
    const { container } = render(<LeaderLine label="Transport">$750</LeaderLine>);
    expect(container.querySelector('dt')).toBeNull();
    expect(container.querySelector('dd')).toBeNull();
  });
});
