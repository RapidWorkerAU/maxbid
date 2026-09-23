import type { ReactNode } from 'react';
import { LineIcon, type LineIconName } from '../../primitives/LineIcon/LineIcon';
import { Wordmark } from '../../primitives/Wordmark/Wordmark';

/**
 * UI47. A sidebar on desktop and a bottom tab bar on mobile, per MF04.
 *
 * The bar sits inside the safe area so it clears the home bar on a phone,
 * which MF05 requires.
 */
export type AppShellLink = {
  href: string;
  label: string;
  icon: LineIconName;
};

export type AppShellProps = {
  links: AppShellLink[];
  /** The path of the page being shown, so the active link can be marked. */
  currentPath: string;
  /** Shown at the foot of the sidebar, such as the organisation name. */
  footer?: ReactNode;
  children: ReactNode;
};

function NavLink({ link, active }: { link: AppShellLink; active: boolean }) {
  return (
    <a
      href={link.href}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-sm px-3 text-sm font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent sm:justify-start ${
        active ? 'bg-surface-muted text-ink' : 'text-ink-muted hover:bg-surface-muted'
      }`}
    >
      <LineIcon name={link.icon} size="sm" />
      {link.label}
    </a>
  );
}

export function AppShell({ links, currentPath, footer, children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-page text-ink sm:flex">
      <header className="border-b border-border bg-surface p-4 sm:w-60 sm:shrink-0 sm:border-e sm:border-b-0">
        <a
          href="/"
          className="inline-flex min-h-11 items-center focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Wordmark size="sm" />
        </a>
        <nav aria-label="Main" className="mt-4 hidden flex-col gap-1 sm:flex">
          {links.map((link) => (
            <NavLink key={link.href} link={link} active={link.href === currentPath} />
          ))}
        </nav>
        {footer ? <div className="mt-6 hidden text-xs text-ink-muted sm:block">{footer}</div> : null}
      </header>

      <main className="flex-1 p-4 pb-24 sm:p-8 sm:pb-8">{children}</main>

      {/* The bottom bar is the same navigation on a phone, per MF04. */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 flex border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden"
      >
        {links.map((link) => (
          <NavLink key={link.href} link={link} active={link.href === currentPath} />
        ))}
      </nav>
    </div>
  );
}
