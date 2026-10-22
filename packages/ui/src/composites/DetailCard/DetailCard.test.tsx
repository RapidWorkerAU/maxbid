import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DetailCard } from './DetailCard';

describe('the card', () => {
  it('shows its label and its contents', () => {
    render(
      <DetailCard label="Identification">
        <p>A 2015 Invented Wagon.</p>
      </DetailCard>,
    );
    expect(screen.getByText('Identification')).toBeTruthy();
    expect(screen.getByText('A 2015 Invented Wagon.')).toBeTruthy();
  });

  it('is a section, so the page has a structure to navigate', () => {
    const { container } = render(<DetailCard label="Costs">Body</DetailCard>);
    expect(container.querySelector('section')).toBeTruthy();
  });

  it('takes the heading level from the caller', () => {
    // A card used as the only section of a page and one used as the fourth of
    // six need different levels, and a wrong one is an accessibility failure
    // the axe gate will not catch.
    render(
      <DetailCard label="Evidence" heading="Comparable sales" as="h3">
        Body
      </DetailCard>,
    );
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('Comparable sales');
  });

  it('has no heading when the label says enough', () => {
    render(<DetailCard label="Costs">Body</DetailCard>);
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('uses a hairline border and no shadow, per B08', () => {
    const { container } = render(<DetailCard label="Costs">Body</DetailCard>);
    const section = container.querySelector('section')!;
    expect(section.className).toContain('border-border');
    expect(section.className).not.toContain('shadow');
  });

  it('never uses marker yellow, which B09 reserves', () => {
    const { container } = render(<DetailCard label="Costs">Body</DetailCard>);
    expect(container.querySelectorAll('.bg-accent')).toHaveLength(0);
  });
});
