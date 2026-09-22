// Token values for code that cannot read CSS variables, such as PDF exports and charts.
export const colors = {
  navy: '#0E2A47',
  page: '#F4F7FA',
  surface: '#FFFFFF',
  surfaceMuted: '#E6EDF4',
  line: '#C9D6E3',
  cyan: '#7FC8F8',
  accent: '#FFD23F',
  ink: '#0E1B2B',
  inkMuted: '#4A5A6D',
  link: '#1B6FD1',
  zoneGreen: '#1E7A52',
  zoneAmber: '#B45309',
  zoneRed: '#B91C1C',
} as const;

export type ColorToken = keyof typeof colors;
