import { Wordmark } from '@maxbid/ui/primitives/Wordmark';

// App home. Replace with the analyses dashboard once auth is in place.
export default function AppHome() {
  return (
    <main className="min-h-dvh px-6 py-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Wordmark />
        <h1 className="text-4xl font-bold">Your analyses</h1>
        <p className="text-lg text-ink-muted">You have not analysed any auctions yet.</p>
      </div>
    </main>
  );
}
