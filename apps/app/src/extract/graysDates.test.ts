import { describe, expect, it } from 'vitest';
import { parseGraysClose, parseGraysCountdown } from './graysDates';

describe('reading a Grays closing time', () => {
  it('reads the format the page actually uses', () => {
    // 9pm AEST is UTC+10, so 11am UTC the same day.
    expect(parseGraysClose('25 Sep 26', '9.00 PM AEST')?.iso).toBe('2026-09-25T11:00:00.000Z');
  });

  it('handles a colon as well as a full stop', () => {
    expect(parseGraysClose('25 Sep 26', '9:30 PM AEST')?.iso).toBe('2026-09-25T11:30:00.000Z');
  });

  it('handles daylight saving, which moves the hour', () => {
    expect(parseGraysClose('25 Nov 26', '9.00 PM AEDT')?.iso).toBe('2026-11-25T10:00:00.000Z');
  });

  it('handles Western Australia', () => {
    expect(parseGraysClose('25 Sep 26', '9.00 PM AWST')?.iso).toBe('2026-09-25T13:00:00.000Z');
  });

  it('handles midnight and midday, where the twelves flip', () => {
    expect(parseGraysClose('25 Sep 26', '12.00 AM AEST')?.iso).toBe('2026-09-24T14:00:00.000Z');
    expect(parseGraysClose('25 Sep 26', '12.00 PM AEST')?.iso).toBe('2026-09-25T02:00:00.000Z');
  });

  it('accepts a four digit year', () => {
    expect(parseGraysClose('25 Sep 2026', '9.00 PM AEST')?.iso).toBe('2026-09-25T11:00:00.000Z');
  });
});

describe('when the format is not what we expect', () => {
  // A wrong closing time is worse than a missing one, because the user would
  // plan around it. F35 puts a live countdown in front of them.
  it('returns nothing rather than guessing at an unknown timezone', () => {
    expect(parseGraysClose('25 Sep 26', '9.00 PM PDT')).toBeNull();
  });

  it('returns nothing for an unreadable date', () => {
    expect(parseGraysClose('sometime next week', '9.00 PM AEST')).toBeNull();
    expect(parseGraysClose('25 Xxx 26', '9.00 PM AEST')).toBeNull();
  });

  it('returns nothing for an unreadable time', () => {
    expect(parseGraysClose('25 Sep 26', 'this evening')).toBeNull();
    expect(parseGraysClose('25 Sep 26', '25.00 PM AEST')).toBeNull();
  });

  it('returns nothing when the timezone is missing', () => {
    expect(parseGraysClose('25 Sep 26', '9.00 PM')).toBeNull();
  });
});

describe('reading a countdown', () => {
  const fetchedAt = '2026-09-29T04:38:09.000Z';

  it('adds the countdown to the moment the page was fetched', () => {
    expect(parseGraysCountdown('6h: 51m: 51s', fetchedAt)).toBe('2026-09-29T11:30:00.000Z');
  });

  it('reads a countdown that runs into days', () => {
    expect(parseGraysCountdown('2d: 1h: 0m: 0s', fetchedAt)).toBe('2026-10-01T05:38:09.000Z');
  });

  it('reads a countdown that names only some units', () => {
    expect(parseGraysCountdown('45m', fetchedAt)).toBe('2026-09-29T05:23:09.000Z');
  });

  it('refuses a countdown it cannot read, rather than closing the lot now', () => {
    expect(parseGraysCountdown('soon', fetchedAt)).toBeNull();
    expect(parseGraysCountdown('', fetchedAt)).toBeNull();
  });

  it('refuses to work from a fetch time it cannot read', () => {
    expect(parseGraysCountdown('6h', 'not a date')).toBeNull();
  });
});
