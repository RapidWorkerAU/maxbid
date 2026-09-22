// Token values for code that cannot read CSS variables, such as PDF exports
// and charts. These must match packages/tokens/tokens.css exactly.
// Source: docs/03-design/design-system.md. Decision records 0009 and 0010.

/** Values used on light pages. */
export const colors = {
  page: '#F4F7FA',
  surface: '#FFFFFF',
  surfaceMuted: '#E6EDF4',
  navy: '#0E2A47',
  border: '#C9D6E3',
  line: '#7FC8F8',
  ink: '#0E1B2B',
  inkMuted: '#4A5A6D',
  accent: '#FFD23F',
  link: '#1B6FD1',
  zoneGreen: '#1E7A52',
  zoneAmber: '#B45309',
  zoneRed: '#B91C1C',
  tagVerified: '#1E7A52',
  tagExtracted: '#E6EDF4',
  tagEstimated: '#FFF4CC',
  tagYourInput: '#1B6FD1',
  confidenceHigh: '#1E7A52',
  confidenceMedium: '#0E1B2B',
  confidenceLow: '#B45309',
  confidenceInsufficient: '#5B6472',
} as const;

/** Values used on navy panels, where the surface is colors.navy. */
export const onNavy = {
  surface: '#0E2A47',
  surfaceMuted: 'rgba(255,255,255,0.14)',
  border: 'rgba(127,200,248,0.5)',
  line: '#7FC8F8',
  ink: '#FFFFFF',
  inkMuted: '#B7CDE3',
  accent: '#FFD23F',
  link: '#7FC8F8',
  zoneGreen: '#6EE7B7',
  zoneAmber: '#FBBF24',
  zoneRed: '#F87171',
  confidenceHigh: '#6EE7B7',
  confidenceMedium: '#FFFFFF',
  confidenceLow: '#FBBF24',
  confidenceInsufficient: '#9CA3AF',
} as const;

/** The text colour that each tag and the accent fill must carry. */
export const fillText = {
  accent: colors.ink,
  tagVerified: colors.surface,
  tagExtracted: colors.ink,
  tagEstimated: colors.ink,
  tagYourInput: colors.surface,
} as const;

export const spacing = {
  /** Standard table row height. */
  row: '36px',
  /** Comfortable table row height, the C09 density switch. */
  rowComfortable: '44px',
  /** Minimum touch target on mobile, per MF03. */
  touchMin: '44px',
} as const;

export const motion = {
  durationFast: '120ms',
  durationBase: '200ms',
  durationSlow: '320ms',
  easeStandard: 'cubic-bezier(0.2, 0, 0, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
} as const;

export const radius = { sm: '2px', md: '2px' } as const;

export type ColorToken = keyof typeof colors;
export type OnNavyToken = keyof typeof onNavy;

export * from './contrast';
