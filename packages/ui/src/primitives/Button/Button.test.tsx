import { render, screen } from '@testing-library/react';
import { contrast, colors, AA_NORMAL_TEXT } from '@maxbid/tokens';
import { describe, expect, it } from 'vitest';
import { Button, ButtonLink } from './Button';

describe('Button', () => {
  it('meets the 44px minimum touch target from MF03', () => {
    render(<Button>Analyse</Button>);
    expect(screen.getByRole('button').className).toContain('min-h-11');
  });

  it('keeps a visible focus ring, which C06 never allows to be removed', () => {
    render(<Button>Analyse</Button>);
    expect(screen.getByRole('button').className).toContain('focus-visible:outline-accent');
  });

  it('uses marker yellow for the primary action only', () => {
    const { rerender } = render(<Button>Analyse</Button>);
    expect(screen.getByRole('button').className).toContain('bg-accent');
    for (const variant of ['secondary', 'ghost', 'danger'] as const) {
      rerender(<Button variant={variant}>Analyse</Button>);
      expect(screen.getByRole('button').className).not.toContain('bg-accent');
    }
  });

  it('renders a link that carries the same styling', () => {
    render(<ButtonLink href="/pricing">See pricing</ButtonLink>);
    const link = screen.getByRole('link', { name: 'See pricing' });
    expect(link.className).toContain('bg-accent');
  });
});

describe('Button loading state', () => {
  it('announces itself as busy and refuses further presses', () => {
    render(<Button loading>Analysing</Button>);
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button).toHaveProperty('disabled', true);
  });

  it('is not busy when it is merely disabled', () => {
    render(<Button disabled>Unavailable</Button>);
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-busy')).toBeNull();
    expect(button).toHaveProperty('disabled', true);
  });

  it('holds the animation back when reduced motion is asked for', () => {
    const { container } = render(<Button loading>Analysing</Button>);
    const bar = container.querySelector('[aria-hidden="true"]');
    // motion-safe is Tailwind's prefers-reduced-motion guard, per C08.
    expect(bar?.className).toContain('motion-safe:animate-pulse');
  });
});

describe('Button colours meet WCAG AA', () => {
  it('reads white on the danger fill', () => {
    expect(contrast(colors.surface, colors.zoneRed)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('reads ink on the marker yellow fill', () => {
    expect(contrast(colors.ink, colors.accent)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('reads ink on the ghost and secondary surfaces', () => {
    expect(contrast(colors.ink, colors.surface)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrast(colors.ink, colors.surfaceMuted)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });
});
