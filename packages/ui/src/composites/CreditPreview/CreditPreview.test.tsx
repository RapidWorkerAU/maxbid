import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CreditPreview } from './CreditPreview';

describe('what the bar says', () => {
  it('says how many lots and what they cost', () => {
    render(<CreditPreview selected={4} available={10} onConfirm={() => {}} />);
    expect(screen.getByText(/4 lots ticked, which costs/)).toBeTruthy();
    expect(screen.getByText('4 credits')).toBeTruthy();
  });

  it('explains what a credit buys, because the term is new here', () => {
    render(<CreditPreview selected={4} available={10} onConfirm={() => {}} />);
    expect(screen.getByText(/A credit pays for one lot to be analysed in full/)).toBeTruthy();
  });

  it('says what would be left afterwards', () => {
    render(<CreditPreview selected={4} available={10} onConfirm={() => {}} />);
    expect(screen.getByText(/You have 10 credits and would have 6 credits left/)).toBeTruthy();
  });

  it('uses the singular for one lot and one credit', () => {
    render(<CreditPreview selected={1} available={2} onConfirm={() => {}} />);
    expect(screen.getByText(/1 lot ticked/)).toBeTruthy();
    expect(screen.getByText('1 credit')).toBeTruthy();
    expect(screen.getByRole('button').textContent).toBe('Analyse this lot');
  });

  it('shows nothing at all when nothing is ticked', () => {
    // A bar that appears before the reader has done anything is a bar they
    // learn to ignore.
    const { container } = render(<CreditPreview selected={0} available={10} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('when there are not enough credits', () => {
  it('says how many more are needed', () => {
    render(<CreditPreview selected={30} available={10} onConfirm={() => {}} />);
    expect(screen.getByText(/you need 20 credits more/)).toBeTruthy();
  });

  it('will not let the shortlist be confirmed', () => {
    // F17. The user cannot exceed the credits they have.
    const onConfirm = vi.fn();
    render(<CreditPreview selected={30} available={10} onConfirm={onConfirm} />);
    const button = screen.getByRole('button');
    expect(button).toHaveProperty('disabled', true);
    fireEvent.click(button);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('does not say the shortlist is too big or suggest dropping lots', () => {
    // It states the cost and leaves the decision alone.
    const { container } = render(<CreditPreview selected={30} available={10} />);
    const words = container.textContent!.toLowerCase();
    expect(words).not.toContain('too many');
    expect(words).not.toContain('remove');
    expect(words).not.toContain('reduce');
  });
});

describe('confirming', () => {
  it('reports the confirm once', () => {
    const onConfirm = vi.fn();
    render(<CreditPreview selected={2} available={10} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('cannot be sent twice while it is being sent', () => {
    const onConfirm = vi.fn();
    render(<CreditPreview selected={2} available={10} onConfirm={onConfirm} confirming />);
    const button = screen.getByRole('button');
    expect(button).toHaveProperty('disabled', true);
    expect(button.textContent).toBe('Starting');
  });

  it('is not offered where there is nothing to confirm to', () => {
    render(<CreditPreview selected={2} available={10} />);
    expect(screen.getByRole('button')).toHaveProperty('disabled', true);
  });
});
