import { getMarketById, getMarketBySlug } from '@/lib/marketUtils';
import { notFound, permanentRedirect } from 'next/navigation';

interface MarketRedirectPageProps {
  params: {
    id: string;
  };
}

/**
 * Server component that redirects old /market/:id URLs to new /event/:slug URLs
 * Handles both numeric IDs and legacy slug-based IDs
 */
export default function MarketRedirectPage({
  params,
}: MarketRedirectPageProps): never {
  const { id } = params;

  // Try to find market by ID first (for numeric IDs like "1", "3", etc.)
  let market = getMarketById(id);

  // If not found, try to find by slug (for legacy slug-based IDs like "nyc-mayor-2025")
  if (!market) {
    market = getMarketBySlug(id);
  }

  // If still not found, return 404
  if (!market) {
    notFound();
  }

  // Redirect to the correct event URL with permanent redirect (308)
  permanentRedirect(`/event/${market.slug}`);
}
