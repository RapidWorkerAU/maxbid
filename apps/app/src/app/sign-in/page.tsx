import { Wordmark } from '@maxbid/ui/primitives/Wordmark';
import type { Metadata } from 'next';
import { SignInForm } from './SignInForm';

export const metadata: Metadata = { title: 'Sign in to MaxBid' };

// SC01. The only page a signed out visitor can reach.
export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 p-6">
      <Wordmark size="lg" />
      <div>
        <h1 className="font-sans text-2xl font-bold">Sign in</h1>
        <p className="mt-2 text-ink-muted">
          MaxBid works out the most you should pay for a lot before the auction
          closes.
        </p>
      </div>
      <SignInForm />
    </main>
  );
}
