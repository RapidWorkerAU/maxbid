/**
 * UI10. The profit zone a proposed bid sits in.
 *
 * The design system is explicit that status is never shown by colour alone,
 * so the label is always rendered. The three names are the ones the token
 * table gives, word for word.
 */
export type Zone = 'onTarget' | 'belowTarget' | 'lossRisk';

export type ZoneLabelProps = {
  zone: Zone;
  /** Solid fills the pill. Quiet is text and a marker, for dense tables. */
  tone?: 'solid' | 'quiet';
  className?: string;
};

const ZONES: Record<Zone, { label: string; solid: string; quiet: string }> = {
  onTarget: {
    label: 'On target',
    solid: 'bg-zone-green text-ink-on-navy',
    quiet: 'text-zone-green',
  },
  belowTarget: {
    label: 'Below target',
    solid: 'bg-zone-amber text-ink-on-navy',
    quiet: 'text-zone-amber',
  },
  lossRisk: {
    label: 'Loss risk',
    solid: 'bg-zone-red text-ink-on-navy',
    quiet: 'text-zone-red',
  },
};

export function ZoneLabel({ zone, tone = 'solid', className = '' }: ZoneLabelProps) {
  const entry = ZONES[zone];
  const shape = 'inline-flex items-center gap-1.5 font-sans text-xs font-semibold';
  if (tone === 'solid') {
    return (
      <span className={`${shape} rounded-sm px-2 py-0.5 ${entry.solid} ${className}`}>
        {entry.label}
      </span>
    );
  }
  return (
    <span className={`${shape} ${entry.quiet} ${className}`}>
      <span aria-hidden="true" className="inline-block size-2 rounded-sm bg-current" />
      {entry.label}
    </span>
  );
}

export const ZONE_LABELS = Object.fromEntries(
  Object.entries(ZONES).map(([key, value]) => [key, value.label]),
) as Record<Zone, string>;
