'use client';

// The controls. The rules they collect choices for live in filters.ts, which
// has no use client on it so a server page can read a query string with
// them. UI55, F16.

import { MonoLabel } from '../../primitives/MonoLabel';
import { ToggleGroup } from '../../primitives/ToggleGroup';
import type { LotFilterState } from './filters';

const CLOSING: { label: string; hours: number | null }[] = [
  { label: 'Any time', hours: null },
  { label: 'Within 6 hours', hours: 6 },
  { label: 'Within a day', hours: 24 },
  { label: 'Within 2 days', hours: 48 },
];

export type LotFiltersProps = {
  filters: LotFilterState;
  onChange: (filters: LotFilterState) => void;
  /** The locations this catalogue actually has. */
  locations: string[];
  /** How many lots the filters are letting through, out of how many. */
  showing: { shown: number; total: number };
  className?: string;
};

/** The least a lot must be worth bidding before it is shown. */
function Floor({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <label className="block">
      <MonoLabel size="xs" tone="ink">
        Worth bidding at least
      </MonoLabel>
      <div className="mt-1 flex items-center gap-1">
        <span className="font-sans text-sm text-ink-muted">$</span>
        {/* An emptied box is no floor rather than a floor of nought, because
            Number('') is 0 and a floor of nought is not what they meant. */}
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={100}
          value={value ?? ''}
          placeholder="Any"
          onChange={(event) =>
            onChange(event.target.value === '' ? null : Number(event.target.value))
          }
          className="w-28 rounded-sm border border-border bg-page px-2 py-1 font-mono text-sm tabular-nums text-ink"
        />
      </div>
    </label>
  );
}

export function LotFilters({
  filters,
  onChange,
  locations,
  showing,
  className = '',
}: LotFiltersProps) {
  const set = (change: Partial<LotFilterState>) => onChange({ ...filters, ...change });

  return (
    <div className={`border border-border bg-surface p-4 ${className}`}>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <Floor value={filters.minMaxBid} onChange={(minMaxBid) => set({ minMaxBid })} />

        <div className="min-w-60 flex-1">
          <ToggleGroup
            legend="Closing"
            value={String(filters.closingWithinHours ?? 'any')}
            onChange={(value) =>
              set({ closingWithinHours: value === 'any' ? null : Number(value) })
            }
            options={CLOSING.map((option) => ({
              value: String(option.hours ?? 'any'),
              label: option.label,
            }))}
          />
        </div>

        {locations.length > 1 ? (
          <label className="block">
            <MonoLabel size="xs" tone="ink">
              Where it is
            </MonoLabel>
            <select
              value={filters.location ?? ''}
              onChange={(event) => set({ location: event.target.value || null })}
              className="mt-1 block rounded-sm border border-border bg-page px-2 py-1 font-sans text-sm text-ink"
            >
              <option value="">Anywhere</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.includeUnvalued}
            onChange={(event) => set({ includeUnvalued: event.target.checked })}
            className="size-4 rounded-sm accent-marker"
          />
          <span className="font-sans text-sm text-ink">Show lots we could not value</span>
        </label>
      </div>

      <p className="mt-3 font-sans text-sm text-ink-muted" aria-live="polite">
        {showing.shown === showing.total
          ? `Showing all ${showing.total} lots.`
          : `Showing ${showing.shown} of ${showing.total} lots. The rest are still in this catalogue, they are just not shown.`}
      </p>
    </div>
  );
}
