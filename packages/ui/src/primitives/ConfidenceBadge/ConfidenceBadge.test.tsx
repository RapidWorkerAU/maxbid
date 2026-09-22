import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConfidenceBadge, bandForScore } from './ConfidenceBadge';

describe('bandForScore', () => {
  it('matches the bands in the valuation spec, including at the edges', () => {
    expect(bandForScore(100)).toBe('high');
    expect(bandForScore(75)).toBe('high');
    expect(bandForScore(74)).toBe('medium');
    expect(bandForScore(50)).toBe('medium');
    expect(bandForScore(49)).toBe('low');
    expect(bandForScore(25)).toBe('low');
    expect(bandForScore(24)).toBe('insufficient');
    expect(bandForScore(0)).toBe('insufficient');
  });
});

describe('ConfidenceBadge', () => {
  it('names the band in words, never colour alone', () => {
    render(<ConfidenceBadge score={82} />);
    expect(screen.getByText('High confidence')).toBeTruthy();
  });

  it('says there is not enough evidence when no score is given', () => {
    render(<ConfidenceBadge />);
    expect(screen.getByText('Not enough evidence')).toBeTruthy();
  });

  it('cannot show a label that disagrees with its own score', () => {
    render(<ConfidenceBadge score={34} showScore />);
    expect(screen.getByText('Low confidence')).toBeTruthy();
    expect(screen.getByText('34')).toBeTruthy();
  });

  it('keeps the score off the badge until it is asked for, and in the title', () => {
    const { container } = render(<ConfidenceBadge score={82} />);
    expect(screen.queryByText('82')).toBeNull();
    expect(container.firstElementChild?.getAttribute('title')).toBe('Confidence score 82 out of 100');
  });

  it('shows no score when the evidence was not enough', () => {
    const { container } = render(<ConfidenceBadge score={12} showScore />);
    expect(screen.queryByText('12')).toBeNull();
    expect(container.firstElementChild?.getAttribute('title')).toBeNull();
  });
});
