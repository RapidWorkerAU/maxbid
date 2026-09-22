/**
 * UI06. Every figure carries one provenance tag, per CP07 and F55.
 * Definitions are in docs/02-specs/transparency.md.
 */
export type Provenance = 'verified' | 'extracted' | 'estimated' | 'yourInput';

export type ProvenanceTagProps = {
  provenance: Provenance;
  className?: string;
};

/** The label is always shown. Colour is never the only signal. */
const TAGS: Record<Provenance, { label: string; classes: string }> = {
  verified: { label: 'Verified', classes: 'bg-tag-verified text-ink-on-navy' },
  extracted: { label: 'Extracted', classes: 'bg-tag-extracted text-ink' },
  estimated: { label: 'Estimated', classes: 'bg-tag-estimated text-ink' },
  yourInput: { label: 'Your input', classes: 'bg-tag-your-input text-ink-on-navy' },
};

export function ProvenanceTag({ provenance, className = '' }: ProvenanceTagProps) {
  const tag = TAGS[provenance];
  return (
    <span
      className={`inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-xs uppercase tracking-wide ${tag.classes} ${className}`}
    >
      {tag.label}
    </span>
  );
}

export const PROVENANCE_LABELS = Object.fromEntries(
  Object.entries(TAGS).map(([key, tag]) => [key, tag.label]),
) as Record<Provenance, string>;
