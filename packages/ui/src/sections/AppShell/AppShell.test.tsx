import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell } from './AppShell';

const links = [
  { href: '/', label: 'Dashboard', icon: 'search' as const },
  { href: '/watchlist', label: 'Watchlist', icon: 'clock' as const },
];

function renderShell(currentPath = '/') {
  return render(
    <AppShell links={links} currentPath={currentPath}>
      <h1>Dashboard</h1>
    </AppShell>,
  );
}

describe('AppShell', () => {
  it('shows the page it is given', () => {
    renderShell();
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy();
  });

  it('marks the current page for screen readers, not colour alone', () => {
    renderShell('/watchlist');
    const current = screen.getAllByRole('link', { name: 'Watchlist' });
    expect(current.every((link) => link.getAttribute('aria-current') === 'page')).toBe(true);
  });

  it('does not mark the other pages', () => {
    renderShell('/watchlist');
    for (const link of screen.getAllByRole('link', { name: 'Dashboard' })) {
      expect(link.getAttribute('aria-current')).toBeNull();
    }
  });

  it('offers the same navigation on desktop and on a phone', () => {
    renderShell();
    const navs = screen.getAllByRole('navigation', { name: 'Main' });
    expect(navs).toHaveLength(2);
    for (const nav of navs) {
      expect(within(nav).getAllByRole('link')).toHaveLength(2);
    }
  });

  it('meets the 44px minimum touch target on every link', () => {
    renderShell();
    for (const link of screen.getAllByRole('link')) {
      if (link.textContent === '') continue;
      expect(link.className).toContain('min-h-11');
    }
  });

  it('carries the wordmark home', () => {
    renderShell();
    expect(screen.getByRole('img', { name: 'MaxBid' })).toBeTruthy();
  });

  it('shows the footer when one is given', () => {
    render(
      <AppShell links={links} currentPath="/" footer="Perth Cabinet Doors">
        <p>Body</p>
      </AppShell>,
    );
    expect(screen.getByText('Perth Cabinet Doors')).toBeTruthy();
  });
});
