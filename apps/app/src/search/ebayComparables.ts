// Turning eBay listings into search results the valuation already understands.
//
// The valuation reads a list of search results, asks a model which of them
// are genuinely the same item, and weighs what it gets back. eBay answers a
// different shape, so rather than teach the valuation about a second kind of
// evidence, its listings are put into the shape the valuation already reads.
//
// That keeps one path through the grading. A second path would be a second
// place for a match level to be decided, and the two would drift.

import type { SearchResult } from './brave';
import type { EbayListing } from './ebay';

/**
 * An eBay listing as a search result, with its price in the snippet.
 *
 * The price goes in the text because that is where the model reads prices
 * from, and because an eBay price read out of the API is more reliable than
 * one read out of a page, so putting it there plainly is the point.
 *
 * The condition goes in too. It is the thing that most changes what a used
 * item is worth, and eBay states it where a web page usually does not.
 */
export function asSearchResult(listing: EbayListing): SearchResult {
  const price = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(listing.price);

  const condition = listing.condition
    ? `Condition: ${listing.condition.toLowerCase().replace(/_/g, ' ')}.`
    : '';

  return {
    title: listing.title,
    url: listing.url,
    snippet: `Asking price ${price}. ${condition} Listed on eBay Australia.`.trim(),
    host: 'ebay.com.au',
  };
}

/**
 * eBay results, then web results, with duplicates by url removed.
 *
 * eBay first because its prices came from an API rather than out of a page,
 * so where the two overlap the one we can trust more is the one the model
 * reads. Searching the web for an item often turns up the same eBay listing,
 * and counting it twice would weigh one asking price as though it were two.
 */
export function withEbayFirst(ebay: SearchResult[], web: SearchResult[]): SearchResult[] {
  const seen = new Set(ebay.map((result) => result.url));
  return [...ebay, ...web.filter((result) => !seen.has(result.url))];
}
