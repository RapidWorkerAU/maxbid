import { StopLine } from '../StopLine/StopLine';

/** MaxBid wordmark. Always written MaxBid, with the stop line beneath Bid. */
export function Wordmark({ onNavy = false }: { onNavy?: boolean }) {
  const color = onNavy ? 'text-ink-on-navy' : 'text-ink';
  return (
    <span className={`inline-flex items-end font-sans text-3xl font-bold ${color}`} aria-label="MaxBid">
      <span aria-hidden="true">Max</span>
      <span aria-hidden="true" className="flex flex-col leading-tight">
        Bid
        <StopLine />
      </span>
    </span>
  );
}
