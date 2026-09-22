/**
 * UI14. Detail B02. The small title block in the corner of a drawing sheet,
 * carrying the project, the sheet and the region.
 *
 * It is a set of label and value pairs, so it renders as a description list
 * and reads as one.
 */
export type TitleBlockEntry = {
  label: string;
  value: string;
};

export type TitleBlockProps = {
  entries: TitleBlockEntry[];
  /** Names the block for screen readers. */
  caption?: string;
  className?: string;
};

export function TitleBlock({ entries, caption = 'Sheet details', className = '' }: TitleBlockProps) {
  return (
    <dl
      aria-label={caption}
      className={`grid grid-cols-[auto_1fr] border border-border-on-navy font-mono text-xs uppercase tracking-widest ${className}`}
    >
      {entries.map((entry) => (
        <div key={entry.label} className="contents">
          <dt className="border-b border-border-on-navy px-2 py-1 text-line last:border-b-0">
            {entry.label}
          </dt>
          <dd className="border-b border-s border-border-on-navy px-2 py-1 text-ink-on-navy last:border-b-0">
            {entry.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
