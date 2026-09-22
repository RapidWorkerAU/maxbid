import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('ties the label to the field', () => {
    render(<Input id="base" label="Base location" />);
    expect(screen.getByLabelText('Base location')).toBeTruthy();
  });

  it('meets the 44px minimum touch target from MF03', () => {
    render(<Input id="base" label="Base location" />);
    expect(screen.getByLabelText('Base location').className).toContain('min-h-11');
  });

  it('describes the field with its hint', () => {
    render(<Input id="base" label="Base location" hint="We use this to estimate transport." />);
    const field = screen.getByLabelText('Base location');
    expect(field.getAttribute('aria-describedby')).toBe('base-hint');
    expect(screen.getByText('We use this to estimate transport.')).toBeTruthy();
  });

  it('marks the field invalid and points at the error', () => {
    render(<Input id="email" label="Email address" error="Enter an email address." />);
    const field = screen.getByLabelText('Email address');
    expect(field.getAttribute('aria-invalid')).toBe('true');
    expect(field.getAttribute('aria-describedby')).toBe('email-error');
  });

  it('points at the hint and the error together when both are shown', () => {
    render(<Input id="url" label="Link" hint="Paste a catalogue link." error="That is not a link." />);
    expect(screen.getByLabelText('Link').getAttribute('aria-describedby')).toBe('url-hint url-error');
  });

  it('is not marked invalid when there is no error', () => {
    render(<Input id="base" label="Base location" />);
    expect(screen.getByLabelText('Base location').getAttribute('aria-invalid')).toBeNull();
  });

  it('switches to Space Mono with tabular figures for lot numbers and data', () => {
    render(<Input id="lot" label="Lot number" mono />);
    expect(screen.getByLabelText('Lot number').className).toContain('font-mono');
  });
});
