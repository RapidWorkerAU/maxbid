'use server';

// Asking for a sale's bids to be re-read, when somebody is looking at it.
// Decision record 0026, consequence 3.
//
// A server action rather than work done in the page, because the fetch takes
// seconds and the page must not wait for it. The figure on screen already says
// how long ago it was read, so the honest thing is to show that and let the
// fresher figure arrive.

import { bidRefreshRequested, inngest } from '../inngest/client';
import { liveSales, needsRefresh } from '../inngest/bidRefresh';

/**
 * Asks for a re-read if this sale is due one, and says whether it did.
 *
 * Due is worked out here rather than in the background job so that opening a
 * sale that was read a minute ago sends nothing at all. The job checks again
 * when it starts, because several people may open the same sale at once.
 */
export async function askForFreshBids(auctionId: string): Promise<boolean> {
  // A sale we could not ask about is not a page we should fail to draw. The
  // figures are already on screen with a note saying when they were read, and
  // the scheduled run will pick the sale up regardless.
  try {
    const now = new Date();
    const sale = (await liveSales(now)).find((row) => row.auctionId === auctionId);
    if (!sale || !needsRefresh(sale, now)) return false;

    await inngest.send({ name: bidRefreshRequested.name, data: { auctionId } });
    return true;
  } catch {
    return false;
  }
}
