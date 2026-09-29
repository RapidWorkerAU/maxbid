// A closed Grays lot page, in the shape a real one comes back in.
//
// Copied from lot 0001-23502297, fetched on 29 September 2026. The figures are
// what that page stated. The product name is invented, because D44 keeps third
// party listing content out of this repository.

export function closedLotPage(
  options: {
    soldFor?: string | null;
    closedAt?: string;
    bids?: number | null;
    odometer?: string | null;
    extra?: string;
  } = {},
) {
  const {
    soldFor = '260',
    closedAt = '25 September 2026 21:00 AEST',
    bids = 20,
    odometer = null,
    extra = '',
  } = options;

  return [
    '### Overview',
    '',
    '| Condition | Used |',
    odometer ? `| Odometer Reading: ${odometer} |` : '',
    '',
    '**Closed:**',
    '',
    `**${closedAt}**`,
    '',
    ...(soldFor ? ['Sold for', `$${soldFor}`] : []),
    '',
    'The auction has ended.',
    '',
    ...(bids === null ? [] : [`Bids (${bids} bids)`]),
    '',
    '| Final Bid Price | Buyers Premium |',
    '| --- | --- |',
    '| ANY | 20% |',
    '',
    "buyers premium not included in the price.",
    extra,
  ].join('\n');
}

/** A lot that sold. */
export const SOLD_PAGE = closedLotPage();

/** A vehicle that sold, with its odometer on the page. */
export const SOLD_VEHICLE_PAGE = closedLotPage({
  soldFor: '35,300',
  closedAt: '11 June 2025 21:30 AEST',
  bids: 406,
  odometer: '243,356',
});

/** A lot that did not sell. */
export const PASSED_IN_PAGE = closedLotPage({
  soldFor: null,
  extra: 'This lot was passed in and did not sell.',
});
