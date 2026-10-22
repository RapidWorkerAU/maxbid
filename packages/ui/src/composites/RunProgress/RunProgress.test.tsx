import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RunProgress } from './RunProgress';

const label = 'Reading the lots you chose, from their photographs';

describe('what the bar says while it runs', () => {
  it('says what is done, what is going and what is left', () => {
    // A sentence saying work has started never changes, so it says something
    // began and leaves the reader to guess whether it still is.
    render(<RunProgress label={label} done={3} running={2} failed={0} total={8} />);
    expect(screen.getByText('3 done, 2 being read now, 3 to go.')).toBeTruthy();
  });

  it('counts the settled ones against the total', () => {
    render(<RunProgress label={label} done={3} running={2} failed={1} total={8} />);
    expect(screen.getByText('4 of 8')).toBeTruthy();
  });

  it('moves the bar as they land', () => {
    const { container } = render(
      <RunProgress label={label} done={4} running={0} failed={0} total={8} />,
    );
    const bar = container.querySelector('[role="progressbar"]')!;
    expect(bar.getAttribute('aria-valuenow')).toBe('4');
    expect(bar.getAttribute('aria-valuemax')).toBe('8');
  });

  it('shows a mark even at the very start', () => {
    // A bar at nought reads as nothing happening.
    const { container } = render(
      <RunProgress label={label} done={0} running={2} failed={0} total={8} />,
    );
    const fill = container.querySelector('[role="progressbar"] > div') as HTMLElement;
    expect(fill.style.width).not.toBe('0%');
  });
});

describe('when it has finished', () => {
  it('says so, rather than leaving the reader to count', () => {
    render(<RunProgress label={label} done={8} running={0} failed={0} total={8} />);
    expect(screen.getByText('Finished. We read 8 lots.')).toBeTruthy();
  });

  it('says what it could not read, and that it was not charged for', () => {
    render(<RunProgress label={label} done={6} running={0} failed={2} total={8} />);
    const note = screen.getByText(/Finished\./).textContent!;
    expect(note).toContain('could not read 2');
    expect(note).toContain('not been charged');
  });

  it('uses the singular for one', () => {
    render(<RunProgress label={label} done={0} running={0} failed={1} total={1} />);
    expect(screen.getByText(/could not read 1/).textContent).toContain('that one');
  });

  it('drops the note about waiting once there is nothing to wait for', () => {
    render(
      <RunProgress
        label={label}
        done={8}
        running={0}
        failed={0}
        total={8}
        note="You can leave this page."
      />,
    );
    expect(screen.queryByText('You can leave this page.')).toBeNull();
  });

  it('shows the note while there is still something to wait for', () => {
    render(
      <RunProgress
        label={label}
        done={1}
        running={1}
        failed={0}
        total={8}
        note="You can leave this page."
      />,
    );
    expect(screen.getByText('You can leave this page.')).toBeTruthy();
  });
});

describe('when there is nothing to show', () => {
  it('shows nothing at all rather than an empty bar', () => {
    const { container } = render(
      <RunProgress label={label} done={0} running={0} failed={0} total={0} />,
    );
    expect(container.firstChild).toBeNull();
  });
});

describe('the Blueprint rules', () => {
  it('fills the bar with the stop line, which is the loading motif', () => {
    // UI12 says the stop line is the brand mark, the active tab marker, the
    // loading motif and the stop line on a bid rail. B09 reserves marker
    // yellow for the main action and the most you should bid, and the motif
    // is the exception the design already made: AnalysisProgress fills its
    // bar the same way.
    const { container } = render(
      <RunProgress label={label} done={3} running={2} failed={0} total={8} />,
    );
    expect(container.querySelector('[role="progressbar"] > div > span')).toBeTruthy();
  });

  it('puts marker yellow nowhere but the bar', () => {
    // B09 reserves it for the main action and the most you should bid. The
    // loading motif is the exception, and a figure on this panel is neither.
    const { container } = render(
      <RunProgress label={label} done={3} running={2} failed={0} total={8} />,
    );
    const marked = [...container.querySelectorAll('.bg-accent')];
    expect(marked.every((node) => node.closest('[role="progressbar"]') !== null)).toBe(true);
  });

  it('uses no dashes, as the writing rules require', () => {
    const { container } = render(
      <RunProgress label={label} done={3} running={2} failed={1} total={8} />,
    );
    expect(container.textContent).not.toMatch(/[–—]/);
  });
});
