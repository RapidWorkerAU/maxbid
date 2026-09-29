import { AppShell } from '@maxbid/ui/sections/AppShell';
import type { Metadata } from 'next';
import { SubmitForm } from './SubmitForm';
import { APP_LINKS } from '../../lib/navigation';

export const metadata: Metadata = { title: 'New analysis' };

// SC03. The PDF drop zone and the cost profile selector arrive with W2.5 and
// W6.4. This is the URL route, which is what F05 covers.
export default function NewAnalysisPage() {
  return (
    <AppShell links={APP_LINKS} currentPath="/new">
      <div className="max-w-xl">
        <h1 className="font-sans text-2xl font-bold">New analysis</h1>
        <p className="mt-2 text-ink-muted">
          Paste a catalogue link and we will read every lot, work out what each
          one is worth and tell you the most you should bid.
        </p>
        <div className="mt-6">
          <SubmitForm />
        </div>
      </div>
    </AppShell>
  );
}
