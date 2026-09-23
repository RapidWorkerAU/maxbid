// Grays closing times, as they appear on a catalogue page.
//
//   **Closes:** 25 Sep 26 [9.00 PM AEST](...)
//
// Two digit years and a named Australian timezone, so this cannot go through
// Date.parse. Getting it wrong moves a closing time by hours, and F35 puts a
// live countdown in front of the user, so it is worth its own module.

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
