// WCAG 2.2 relative luminance and contrast ratio.
// Used by the token contrast test, and available to any component that needs
// to check a colour pairing at runtime.

/** Relative luminance of a hex colour, per the WCAG definition. */
export function luminance(hex: string): number {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const [r = 0, g = 0, b = 0] = channels;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two hex colours, from 1 to 21. */
export function contrast(a: string, b: string): number {
  const first = luminance(a);
  const second = luminance(b);
  const [high, low] = first > second ? [first, second] : [second, first];
  return (high + 0.05) / (low + 0.05);
}

/** WCAG 2.2 AA needs 4.5 to 1 for normal text and 3 to 1 for large text. */
export const AA_NORMAL_TEXT = 4.5;
export const AA_LARGE_TEXT = 3;
