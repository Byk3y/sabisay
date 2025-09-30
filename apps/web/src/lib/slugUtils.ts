/**
 * Utility functions for URL slug generation and event URL building
 */

/**
 * Convert a string to a URL-safe slug
 * @param input - The input string to convert
 * @returns A URL-safe slug
 */
export function toSlug(input: string): string {
  if (!input) return '';

  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 120); // Limit to ~120 characters
}

/**
 * Build an event URL from market slug
 * @param marketSlug - The market slug
 * @returns The complete event URL
 */
export function buildEventUrl(marketSlug: string): string {
  return `/event/${marketSlug}`;
}

/**
 * Generate a market slug from market data
 * @param market - Market object
 * @returns A market slug
 */
export function generateMarketSlug(market: { slug?: string; question?: string; title?: string; id?: string }): string {
  // Use existing slug if available
  if (market.slug) {
    return market.slug;
  }

  // Generate from question/title
  if (market.question) {
    return toSlug(market.question);
  }

  if (market.title) {
    return toSlug(market.title);
  }

  // Fallback to ID if no title available
  return toSlug(market.id || 'unknown');
}
