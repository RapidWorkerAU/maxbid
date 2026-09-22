import type { InputHTMLAttributes } from 'react';

/**
 * UI02. Text, number, URL and email, with a label, an optional hint and an
 * optional error.
 *
 * The id is required rather than generated, so this stays a server
 * component. Generating one would need a hook, which would make every form
 * field client side for no gain, against BA05.
 */
export type InputProps = {
  id: string;
  label: string;
  /** Plain sentence explaining the field, per WR07. */
  hint?: string;
  /** Says what happened and what the user can do. Never blames the user. */
  error?: string;
  /** Space Mono, for lot numbers, model codes and figures. */
  mono?: boolean;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'>;

const FIELD =
  'block w-full min-h-11 rounded-sm border bg-surface px-3 py-2 text-base text-ink ' +
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

export function Input({
  id,
  label,
  hint,
  error,
  mono = false,
  className = '',
  type = 'text',
  ...rest
}: InputProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="font-sans text-sm font-semibold text-ink">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="font-sans text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
      <input
        id={id}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${FIELD} ${error ? 'border-zone-red' : 'border-border'} ${mono ? 'font-mono tabular-nums' : 'font-sans'}`}
        {...rest}
      />
      {error ? (
        <p id={errorId} className="font-sans text-xs text-zone-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}
