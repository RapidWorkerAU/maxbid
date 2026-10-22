import { DetailCard } from '@maxbid/ui/composites/DetailCard';
import { MonoLabel } from '@maxbid/ui/primitives/MonoLabel';
import { agoInWords, cardNote, type AnalysisCard } from './dashboard';

/**
 * The analyses this organisation has run. SC02.
 *
 * Newest first, because the one you started a minute ago is the one you came
 * back for. Each card says what the analysis is doing or what it found, and
 * never that it is ready when it has nothing to show.
 */
export function AnalysisCards({
  cards,
  className = '',
}: {
  cards: AnalysisCard[];
  className?: string;
}) {
  if (cards.length === 0) {
    return (
      <DetailCard className={className} label="Analyses" heading="Nothing yet">
        <p className="font-sans text-sm text-ink-muted">
          You have not analysed a catalogue yet. Paste a Grays link to start one, and it will appear
          here while it runs.
        </p>
      </DetailCard>
    );
  }

  return (
    <DetailCard className={className} label="Analyses" heading="What you have run">
      <ul className="divide-y divide-border">
        {cards.map((card) => (
          <li key={card.id} className="py-3 first:pt-0 last:pb-0">
            <a
              href={`/analysis/${card.id}`}
              className="font-sans text-base font-semibold text-link underline"
            >
              {card.title}
            </a>
            <p className="mt-1 font-sans text-sm text-ink-muted">{cardNote(card)}</p>
            <MonoLabel size="xs" className="mt-1 block">
              {agoInWords(card.createdAt)}
            </MonoLabel>
          </li>
        ))}
      </ul>
    </DetailCard>
  );
}
