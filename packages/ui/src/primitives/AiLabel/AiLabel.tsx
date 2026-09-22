/**
 * UI07. D64 and F56 require every piece of AI generated content to be
 * labelled: identifications, match reasons, difference lists and summaries.
 *
 * CP07 is clear that this sits alongside the provenance tag and never
 * replaces it, so this is a separate marker rather than a fifth tag.
 */
export type AiLabelProps = {
  /** Adds the reason beneath, such as DS33 beside a match reason. */
  detail?: string;
  className?: string;
};

export function AiLabel({ detail, className = '' }: AiLabelProps) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
      <span className="inline-flex items-center rounded-sm border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-xs uppercase tracking-wide text-ink">
        AI generated
      </span>
      {detail ? <span className="font-sans text-xs text-ink-muted">{detail}</span> : null}
    </span>
  );
}
