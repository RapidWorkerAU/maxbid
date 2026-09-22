import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button, ButtonLink } from './Button';

describe('Button', () => {
  it('meets the 44px minimum touch target from MF03', () => {
    render(<Button>Analyse</Button>);
    expect(screen.getByRole('button').className).toContain('min-h-11');
  });

  it('is marker yellow for the primary action and outlined for the secondary', () => {
    const { rerender } = render(<Button>Analyse</Button>);
    expect(screen.getByRole('button').className).toContain('bg-accent');
    rerender(<Button variant="secondary">Download</Button>);
    expect(screen.getByRole('button').className).not.toContain('bg-accent');
  });

  it('keeps a visible focus ring, which C06 never allows to be removed', () => {
    render(<Button>Analyse</Button>);
    expect(screen.getByRole('button').className).toContain('focus-visible:outline-accent');
  });

  it('renders a link that carries the same styling', () => {
    render(<ButtonLink href="/pricing">See pricing</ButtonLink>);
    const link = screen.getByRole('link', { name: 'See pricing' });
    expect(link).toHaveProperty('href');
    expect(link.className).toContain('bg-accent');
  });
});
