import type { AppShellLink } from '@maxbid/ui/sections/AppShell';

/** The app navigation, in one place so every page shows the same set. */
export const APP_LINKS: AppShellLink[] = [
  { href: '/', label: 'Dashboard', icon: 'search' },
  { href: '/new', label: 'New analysis', icon: 'flag' },
  { href: '/watchlist', label: 'Watchlist', icon: 'clock' },
  { href: '/outcomes', label: 'Outcomes', icon: 'check' },
];
