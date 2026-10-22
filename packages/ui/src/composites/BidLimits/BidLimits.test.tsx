import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BidLimits } from './BidLimits';

// The worked example from bid-calculation.md, GST registered buyer.
const figures = { targetBid: 7936, limitBid: 10081, breakEvenBid: 11369 };

describe('the three figures', () => {
  it('shows all three', () => {
    render(<BidLimits {...figures} />);
    expect(screen.getByText('$7,936')).toBeTruthy();
    expect(screen.getByText('$10,081')).toBeTruthy();
    expect(screen.getByText('$11,369')).toBeTruthy();
  });

  it('calls the target bid the most you should bid', () => {
    // Decision record 0002 names it the target bid internally and shows it to
    // the user as the most you should bid.
    render(<BidLimits {...figures} />);
    expect(screen.getByText('The most you should bid')).toBeTruthy();
  });

  it('explains every term, because this is where all three first appear', () => {
    render(<BidLimits {...figures} />);
    expect(screen.getByText(/called the target bid/)).toBeTruthy();
    expect(screen.getByText(/smallest profit you said you would accept/)).toBeTruthy();
    expect(screen.getByText(/estimated profit is nothing/)).toBeTruthy();
  });

  it('rounds a bid figure down, never up', () => {
    // Decision record 0003. Rounding a bid up would hand the user a figure
    // above the one the maths allows.
    render(<BidLimits targetBid={7936.99} limitBid={null} breakEvenBid={null} />);
    expect(screen.getByText('$7,936')).toBeTruthy();
  });
});

describe('the ordering problem', () => {
  it('warns that a bid above break even loses money', () => {
    // Break even is the highest of the three, so a reader who assumes the
    // biggest number is the answer reads the screen exactly backwards.
    render(<BidLimits {...figures} />);
    expect(screen.getByText(/loses money/)).toBeTruthy();
  });

  it('says plainly that the highest figure is not the one to aim for', () => {
    render(<BidLimits {...figures} />);
    expect(screen.getByText(/not the figure to aim for/)).toBeTruthy();
  });

  it('marks only the target bid, never the highest figure', () => {
    // B09 reserves marker yellow for the main action and the most you should
    // bid. On this component that is the smallest of the three numbers.
    const { container } = render(<BidLimits {...figures} />);
    const marked = container.querySelectorAll('.bg-accent');
    expect(marked).toHaveLength(1);
    expect(marked[0]!.textContent).toBe('$7,936');
  });
});

describe('when there are no figures', () => {
  it('gives the reason rather than three blanks', () => {
    // F26. Three blanks invite the reader to supply their own answer.
    render(
      <BidLimits
        targetBid={null}
        limitBid={null}
        breakEvenBid={null}
        missingReason="We could not find enough comparable sales to work out what this lot is worth."
      />,
    );
    expect(screen.getByText(/not find enough comparable sales/)).toBeTruthy();
  });

  it('still shows the figures it has when only some are missing', () => {
    render(<BidLimits targetBid={7936} limitBid={null} breakEvenBid={null} missingReason="No." />);
    expect(screen.getByText('$7,936')).toBeTruthy();
    expect(screen.queryByText('No.')).toBeNull();
  });

  it('says a figure is not worked out rather than showing nothing', () => {
    render(<BidLimits targetBid={7936} limitBid={null} breakEvenBid={null} />);
    expect(screen.getAllByText('Not worked out')).toHaveLength(2);
  });
});
