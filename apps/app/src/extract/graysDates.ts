// Grays closing times, as they appear on a catalogue page.
//
// Two forms, because Grays serves two catalogue layouts:
//
//   **Closes:** 25 Sep 26 [9.00 PM AEST](...)
//   Ends in 6h: 51m: 51s
//
// The first is an instant. The second is a countdown, which only means
// something alongside the moment the page was fetched. Two digit years and a
// named Australian timezone rule out Date.parse. Getting either wrong moves a
// closing time by hours, and F35 puts a live countdown in front of the user,
// so this is worth its own module.

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** Offsets in hours. Australian auction sites quote the eastern zones. */
const ZONES: Record<string, number> = {
  AEST: 10,
  AEDT: 11,
  ACST: 9.5,
  ACDT: 10.5,
  AWST: 8,
};

export type ParsedClose = {
  /** ISO 8601, in UTC. */
  iso: string;
  zone: string;
};

/**
 * Reads a Grays closing time.
 *
 * Returns null rather than guessing when anything is unrecognised. A wrong
 * closing time is worse than a missing one, because the user would plan
 * around it.
 */
export function parseGraysClose(dateText: string, timeText: string): ParsedClose | null {
  const date = dateText.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\w*\s+(\d{2}|\d{4})$/);
  if (!date) return null;

  const [, dayText, monthText, yearText] = date;
  const month = MONTHS[monthText!.toLowerCase()];
  if (month === undefined) return null;

  const day = Number(dayText);
  // Two digit years are this century. These are upcoming auctions, not history.
  const year = yearText!.length === 2 ? 2000 + Number(yearText) : Number(yearText);

  const time = timeText.trim().match(/^(\d{1,2})[.:](\d{2})\s*(AM|PM)?\s*([A-Z]{4})$/i);
  if (!time) return null;

  const [, hourText, minuteText, meridiem, zoneText] = time;
  const zone = zoneText!.toUpperCase();
  const offset = ZONES[zone];
  if (offset === undefined) return null;

  let hour = Number(hourText);
  const minute = Number(minuteText);
  if (meridiem) {
    const upper = meridiem.toUpperCase();
    if (upper === 'PM' && hour !== 12) hour += 12;
    if (upper === 'AM' && hour === 12) hour = 0;
  }
  if (hour > 23 || minute > 59) return null;

  // Shift the local time back to UTC by the zone offset.
  const utc = Date.UTC(year, month, day, hour, minute) - offset * 60 * 60 * 1000;
  const parsed = new Date(utc);
  if (Number.isNaN(parsed.getTime())) return null;

  return { iso: parsed.toISOString(), zone };
}

/** How many seconds each unit in a countdown is worth. */
const UNITS: Record<string, number> = { d: 86400, h: 3600, m: 60, s: 1 };

/**
 * Turns a countdown into an instant, using the moment the page was fetched.
 *
 * "6h: 51m: 51s" on its own says nothing. Added to the fetch time it becomes a
 * closing time, accurate to about as long as the fetch took. That is why the
 * fetch time is stored beside the page in raw_extract.
 *
 * Returns null when nothing is recognised, rather than treating an unreadable
 * countdown as zero and closing the lot immediately.
 */
export function parseGraysCountdown(text: string, fetchedAt: string): string | null {
  const from = new Date(fetchedAt);
  if (Number.isNaN(from.getTime())) return null;

  let seconds = 0;
  let found = false;
  for (const match of text.matchAll(/(\d+)\s*([dhms])\b/gi)) {
    const unit = UNITS[match[2]!.toLowerCase()];
    if (unit === undefined) continue;
    seconds += Number(match[1]) * unit;
    found = true;
  }
  if (!found) return null;

  return new Date(from.getTime() + seconds * 1000).toISOString();
}
