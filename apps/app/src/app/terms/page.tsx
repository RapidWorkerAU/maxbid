import { DS01 } from '@maxbid/content';
import { MonoLabel } from '@maxbid/ui/primitives/MonoLabel';
import { SheetFrame } from '@maxbid/ui/primitives/SheetFrame';
import type { Metadata } from 'next';
import { AcceptForm } from './AcceptForm';
import { supabaseServer } from '../../lib/supabase';

export const metadata: Metadata = { title: 'Accept the terms' };

// F66. The clickwrap is the only disclaimer that interrupts the user, per PR04.
export default async function TermsPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from('terms_versions')
    .select('version, published_at')
    .eq('is_material', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const version = data?.version ?? '1.0.0';

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 p-6">
      <h1 className="font-sans text-2xl font-bold">Before you start</h1>
      <SheetFrame>
        <MonoLabel tone="onNavy">Terms version {version}</MonoLabel>
        <p className="mt-3 leading-relaxed">{DS01}</p>
      </SheetFrame>
      <AcceptForm version={version} />
    </main>
  );
}
