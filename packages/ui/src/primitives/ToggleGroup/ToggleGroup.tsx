'use client';

/**
 * UI03. A small set of choices shown side by side, such as GST registered
 * yes or no, or a profit target in dollars or as a percentage.
 *
 * Each choice is a button carrying aria-pressed, so a screen reader hears
 * which one is active rather than seeing it only in the colour.
 */
export type ToggleOption<T extends string> = {
  value: T;
  label: string;
};

export type ToggleGroupProps<T extends string> = {
  /** Names the group for screen readers, such as GST registered. */
  legend: string;
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

const CHOICE =
  'min-h-11 flex-1 rounded-sm border px-4 font-sans text-base font-semibold ' +
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent';

export function ToggleGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  className = '',
}: ToggleGroupProps<T>) {
  return (
    <div role="group" aria-label={legend} className={`flex gap-2 ${className}`}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`${CHOICE} ${
              active
                ? 'border-ink bg-ink text-ink-on-navy'
                : 'border-border bg-surface text-ink hover:bg-surface-muted'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
