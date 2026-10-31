import { exclusionNote } from '@maxbid/content';
import { AppShell } from '@maxbid/ui/sections/AppShell';
import { LotDetail } from '@maxbid/ui/sections/LotDetail';
import { formatMoney } from '@maxbid/ui/primitives/Money';
import { notFound } from 'next/navigation';
import { heaviestFirst, toComparables, type EvidenceRecord } from './lot';
import { CorrectForm } from './CorrectForm';
import { ExcludeControl } from './ExcludeControl';
import { readLot } from './readLot';
import { APP_LINKS } from '../../../../../lib/navigation';
import { supabaseServer } from '../../../../../lib/supabase';

// SC06. One lot, and the evidence behind every figure on it. F59.
export default async function LotPage({
  params,
}: {
  params: Promise<{ id: string; lotId: string }>;
}) {
  const { id, lotId } = await params;
  const supabase = await supabaseServer();
  const read = await readLot(supabase, id, lotId);
  if (!read) notFound();

  const effect = read.exclusionEffect;

  return (
    <AppShell links={APP_LINKS} currentPath="/new">
      <a href={`/analysis/${id}`} className="font-sans text-sm text-link underline">
        Back to every lot in this catalogue
      </a>
      <LotDetail
        className="mt-6"
        lot={read.lot}
        valuation={read.valuation}
        comparables={heaviestFirst(
          toComparables(read.evidence as EvidenceRecord[], new Date(), read.setAside),
        )}
        bids={read.bids}
        missingBidReason={read.missingBidReason}
        method={read.method}
        correction={
          <CorrectForm
            analysisId={id}
            lotId={lotId}
            current={read.current}
            alreadyCorrected={read.correctedByYou}
          />
        }
        exclusionFor={(comparable) => (
          <ExcludeControl
            analysisId={id}
            lotId={lotId}
            comparableId={comparable.id}
            setAside={Boolean(comparable.excludedReason)}
          />
        )}
        // The standard wording, filled here rather than in the component,
        // because disclaimer text is never typed into one. DS17, F62.
        exclusionNote={
          effect
            ? exclusionNote(
                effect.excluded,
                formatMoney({ amount: effect.before }),
                formatMoney({ amount: effect.after }),
              )
            : undefined
        }
      />
    </AppShell>
  );
}
