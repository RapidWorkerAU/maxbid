import { ButtonLink } from '@maxbid/ui/primitives/Button';
import { Wordmark } from '@maxbid/ui/primitives/Wordmark';
import { DS01 } from '@maxbid/content';

// Holding page with waitlist, roadmap Week 1. Replace with the signed off homepage sections.
export default function HomePage() {
  return (
    <main className="min-h-dvh bg-navy px-6 py-16 text-ink-on-navy">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <Wordmark onNavy />
        <h1 className="text-5xl font-bold leading-tight">What should you pay at auction?</h1>
        <p className="text-xl text-ink-muted-on-navy">
          MaxBid will estimate what each lot is worth, add up every cost and tell you the most you
          should bid. Join the waitlist to get early access and founding member pricing.
        </p>
        <div>
          <ButtonLink href="#waitlist">Join the waitlist</ButtonLink>
        </div>
        <p className="text-sm text-ink-muted-on-navy">{DS01}</p>
      </div>
    </main>
  );
}
