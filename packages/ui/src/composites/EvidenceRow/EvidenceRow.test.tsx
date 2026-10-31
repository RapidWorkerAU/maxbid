import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EvidenceRow, ageInWords, type Comparable } from './EvidenceRow';

const comparable: Comparable = {
  id: '1',
  title: '2015 Invented Wagon Alpha Diesel',
  price: 18500,
  matchLevel: 'exact',
  weight: 0.95,
  ageInDays: 30,
  source: 'Grays auction result',
  sold: true,
};

describe('what the evidence shows', () => {
  it('shows the price and what the comparable was', () => {
    render(<EvidenceRow comparable={comparable} />);
    expect(screen.getByText('$18,500')).toBeTruthy();
    expect(screen.getByText('2015 Invented Wagon Alpha Diesel')).toBeTruthy();
  });

  it('says whether the price was paid or asked', () => {
    // Decision record 0020 weights a sold price at 0.95 and an asking price
    // at 0.6, so which one it is changes what the figure means.
    render(<EvidenceRow comparable={comparable} />);
    expect(screen.getByText(/Sold price from Grays auction result/)).toBeTruthy();

    render(<EvidenceRow comparable={{ ...comparable, sold: false }} />);
    expect(screen.getByText(/Asking price from Grays auction result/)).toBeTruthy();
  });

  it('shows the weight it carried, so the range can be checked', () => {
    render(<EvidenceRow comparable={comparable} />);
    expect(screen.getByText(/0\.95/)).toBeTruthy();
  });

  it('links to the listing where we hold one', () => {
    render(<EvidenceRow comparable={{ ...comparable, url: 'https://example.test/lot/1' }} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('https://example.test/lot/1');
    // A third party page opened from ours must not be able to reach back.
    expect(link.getAttribute('rel')).toContain('noreferrer');
  });

  it('shows the title as plain text when there is no listing to link to', () => {
    render(<EvidenceRow comparable={comparable} />);
    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('saying how old a price is', () => {
  it('uses days inside the month', () => {
    expect(ageInWords(0)).toBe('Today');
    expect(ageInWords(1)).toBe('Yesterday');
    expect(ageInWords(14)).toBe('14 days ago');
  });

  it('uses months beyond that', () => {
    // 412 days ago is not a useful fact to a person deciding what to bid.
    expect(ageInWords(60)).toBe('2 months ago');
    // 30 days stays in days, because "30 days ago" is more precise than "1
    // month ago" and no less readable.
    expect(ageInWords(30)).toBe('30 days ago');
    expect(ageInWords(31)).toBe('1 month ago');
  });

  it('uses years once months stop being readable', () => {
    expect(ageInWords(730)).toBe('2 years ago');
  });

  it('says the date is unknown rather than inventing an age', () => {
    expect(ageInWords(-1)).toBe('Date unknown');
  });
});

describe('the Blueprint rules', () => {
  it('never uses marker yellow, because evidence is not an action or a bid', () => {
    const { container } = render(<EvidenceRow comparable={comparable} />);
    expect(container.querySelectorAll('.bg-accent')).toHaveLength(0);
  });

  it('keeps a long title on one line, with the full text available', () => {
    const long = { ...comparable, title: 'A'.repeat(200) };
    const { container } = render(<EvidenceRow comparable={long} />);
    const titled = container.querySelector('[title]');
    expect(titled?.className).toContain('truncate');
  });
});

describe('why a comparable counted', () => {
  // F21. A match level on its own is our verdict with the reasoning left
  // out, which is the opposite of what the evidence panel is for: the reader
  // is deciding whether to trust the range, and "near exact" tells them
  // nothing they can check.
  const reason = 'Same model and year, one trim level higher, 60,000 km fewer.';

  it('shows the reason beside the comparable', () => {
    render(<EvidenceRow comparable={{ ...comparable, reason }} />);
    expect(screen.getByText(reason)).toBeTruthy();
  });

  it('shows nothing where no reason was recorded', () => {
    // A blank line would read as a reason we had and did not give.
    const withReason = render(<EvidenceRow comparable={{ ...comparable, reason }} />);
    const lines = withReason.container.querySelectorAll('p').length;
    withReason.unmount();

    const { container } = render(<EvidenceRow comparable={{ ...comparable, reason: null }} />);
    expect(container.querySelectorAll('p')).toHaveLength(lines - 1);
    expect(container.textContent).not.toContain('undefined');
  });

  it('lets a long reason wrap rather than truncating it', () => {
    // It is a sentence, not a code. The row above it is one line a cell; this
    // is the part somebody reads.
    const long = `${reason} ${reason} ${reason}`;
    const { container } = render(<EvidenceRow comparable={{ ...comparable, reason: long }} />);
    const shown = [...container.querySelectorAll('p')].find((p) => p.textContent === long)!;
    expect(shown.className).not.toContain('truncate');
  });
});
