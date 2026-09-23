import { DS01 } from '@maxbid/content';
import { MonoLabel } from '@maxbid/ui/primitives/MonoLabel';
import { Wordmark } from '@maxbid/ui/primitives/Wordmark';
import { WaitlistForm } from './WaitlistForm';

// F78. The holding page until the full marketing site arrives in Phase 2.
export default function HomePage() {
  return (
    <main className="min-h-dvh bg-navy px-6 py-16 text-ink-on-navy">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <Wordmark onNavy size="lg" />
        <h1 className="text-4xl leading-tight font-bold sm:text-5xl">
          Know the most you should pay before the hammer falls.
        </h1>
        <p className="text-lg text-ink-muted-on-navy sm:text-xl">
          MaxBid reads an auction catalogue, works out what each lot is really
          worth, adds up every cost including the buyer&apos;s premium, GST and
          transport, and tells you the most you should bid.
        </p>
        <div>
          <MonoLabel tone="onNavy">Founding members</MonoLabel>
          <p className="mt-2 text-ink-muted-on-navy">
            Everyone who joins before launch keeps founding member pricing.
          </p>
        </div>
        <WaitlistForm />
        <p className="text-sm text-ink-muted-on-navy">{DS01}</p>
      </div>
    </main>
  );
}
