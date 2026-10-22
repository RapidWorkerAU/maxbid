import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PriceLine } from './PriceLine';

describe('the figure', () => {
  it('shows the label and the money', () => {
    render(<PriceLine label="Transport" amount={450} />);
    expect(screen.getByText('Transport')).toBeTruthy();
    expect(screen.getByText('$450')).toBeTruthy();
  });

  it('rounds a bid figure down and never up', () => {
    // Decision record 0003.
    render(<PriceLine label="Target bid" amount={7936.99} rounding="down" />);
    expect(screen.getByText('$7,936')).toBeTruthy();
  });

  it('shows cents only when asked, for the calculator detail', () => {
    render(<PriceLine label="Premium" amount={544.5} showCents />);
    expect(screen.getByText('$544.50')).toBeTruthy();
  });

  it('shows the note that says what the figure is', () => {
    render(
      <PriceLine label="Break even bid" amount={11369} note="A bid above this loses money." />,
    );
    expect(screen.getByText('A bid above this loses money.')).toBeTruthy();
  });
});

describe('when there is no figure', () => {
  it('says so rather than leaving a blank', () => {
    // A blank reads as a figure of nothing, which is a different statement
    // from not having worked it out.
    render(<PriceLine label="Target bid" amount={null} />);
    expect(screen.getByText('Not worked out')).toBeTruthy();
  });

  it('lets the caller say why instead', () => {
    render(<PriceLine label="Target bid" amount={null} emptyText="Below your target" />);
    expect(screen.getByText('Below your target')).toBeTruthy();
  });

  it('never shows a zero where there is no figure', () => {
    render(<PriceLine label="Target bid" amount={null} />);
    expect(screen.queryByText('$0')).toBeNull();
  });
});

describe('marker yellow', () => {
  it('is off unless the caller asks, because B09 reserves it', () => {
    const { container } = render(<PriceLine label="Transport" amount={450} />);
    expect(container.querySelectorAll('.bg-accent')).toHaveLength(0);
  });

  it('marks the figure when the caller asks', () => {
    const { container } = render(
      <PriceLine label="The most you should bid" amount={7936} emphasis />,
    );
    expect(container.querySelectorAll('.bg-accent')).toHaveLength(1);
  });

  it('is not used on an empty figure, which is not a bid to make', () => {
    const { container } = render(
      <PriceLine label="The most you should bid" amount={null} emphasis />,
    );
    expect(container.querySelectorAll('.bg-accent')).toHaveLength(0);
  });
});
