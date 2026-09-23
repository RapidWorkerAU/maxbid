import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmailCapture, type EmailCaptureState } from './EmailCapture';

const base = {
  id: 'waitlist-email',
  label: 'Email address',
  submitLabel: 'Join the waitlist',
  pendingLabel: 'Adding you to the waitlist',
  successHeading: 'You are on the list',
  successBody: 'We will email you when MaxBid opens.',
  action: vi.fn(),
};

function renderCapture(state: EmailCaptureState, pending = false) {
  return render(<EmailCapture {...base} state={state} pending={pending} />);
}

describe('EmailCapture', () => {
  it('asks for an email address with a real label', () => {
    renderCapture({ status: 'idle' });
    expect(screen.getByLabelText('Email address')).toBeTruthy();
  });

  it('uses an email field, so a phone offers the right keyboard', () => {
    renderCapture({ status: 'idle' });
    expect(screen.getByLabelText('Email address').getAttribute('type')).toBe('email');
  });

  it('shows the error beneath the field and marks it invalid', () => {
    renderCapture({ status: 'error', message: 'Enter an email address.' });
    const field = screen.getByLabelText('Email address');
    expect(field.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Enter an email address.')).toBeTruthy();
  });

  it('says what it is doing while it works, and stops a second press', () => {
    renderCapture({ status: 'idle' }, true);
    const button = screen.getByRole('button');
    expect(button.textContent).toBe('Adding you to the waitlist');
    expect(button.getAttribute('aria-busy')).toBe('true');
  });

  it('replaces the form with a confirmation once the address is stored', () => {
    renderCapture({ status: 'success' });
    expect(screen.getByRole('heading', { name: 'You are on the list' })).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByLabelText('Email address')).toBeNull();
  });

  it('shows the note only when one is given', () => {
    const { rerender } = renderCapture({ status: 'idle' });
    expect(screen.queryByText(/only use your address/)).toBeNull();
    rerender(
      <EmailCapture
        {...base}
        state={{ status: 'idle' }}
        note="We will only use your address to tell you when MaxBid opens."
      />,
    );
    expect(screen.getByText(/only use your address/)).toBeTruthy();
  });
});
