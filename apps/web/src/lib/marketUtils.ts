/**
 * Market utility functions
 * Extracted from page.tsx for better organization and reusability
 */

import { mockMarkets, extraFeedItems, binaryMembers, type RawMarket } from '@/lib/mock';
import type { Market, Outcome, RelatedMarket, UiStyle } from '@/types/market';

/**
 * Get market by ID from mock data
 * @param id - The market ID to search for
 * @returns Market object or null if not found
 */
export const getMarketById = (id: string): Market | null => {
  // Search in all mock data arrays
  const allMarkets = [...mockMarkets, ...extraFeedItems, ...binaryMembers];
  
  // Find market by ID (only look at items with 'id' property, not 'groupId')
  const market = allMarkets.find(m => 'id' in m && m.id === id);
  if (!market) return null;
  
  return transformMarketData(market as RawMarket);
};

/**
 * Map old style name to new one while reading
 * @param style - The uiStyle value to normalize
 * @returns Normalized uiStyle value
 */
export function normalizeUiStyle(style?: UiStyle): UiStyle | undefined {
  if (style === "chance") return "binary";
  return style;
}

/**
 * True binary by Yes/No labels (case/space tolerant)
 * @param labels - Array of outcome labels
 * @returns true if exactly 2 outcomes with "Yes" and "No" labels
 */
export function labelsAreYesNo(labels: string[] = []): boolean {
  if (labels.length !== 2) return false;
  const norm = (s: string) => (s ?? "").trim().toLowerCase();
  const set = new Set(labels.map(norm));
  return set.has("yes") && set.has("no");
}

/**
 * Authoritative check for binary market view - only true Yes/No markets or explicitly tagged
 * @param market - Market object with uiStyle and outcomes
 * @returns true if market should render with binary UI
 */
export function isBinaryMarketView(market: { uiStyle?: string; outcomes?: any[] }): boolean {
  const style = normalizeUiStyle(market?.uiStyle as UiStyle);
  if (style === "binary") return true;
  const labels = market?.outcomes?.map((o: any) => o?.name ?? o?.label) ?? [];
  return labelsAreYesNo(labels);
}

/**
 * @deprecated Use isBinaryMarketView instead - this only checks outcome count
 * Check if a market should be classified as a binary/chance market
 * @param rawMarket - Raw market data from mock
 * @returns true if market has exactly 2 outcomes and should be a chance market
 */
export const isBinaryMarket = (rawMarket: RawMarket): boolean => {
  return rawMarket.outcomes.length === 2;
};

/**
 * Transform raw market data to the format used in the market details page
 * @param rawMarket - Raw market data from mock
 * @returns Transformed market data
 */
export const transformMarketData = (rawMarket: RawMarket): Market => {
  // Only set uiStyle to "binary" for true Yes/No markets or explicitly tagged markets
  const uiStyle: UiStyle | undefined = rawMarket.uiStyle || (labelsAreYesNo(rawMarket.outcomes.map(o => o.label)) ? "binary" : undefined);
  
  const market: Market = {
    id: rawMarket.id,
    title: rawMarket.question,
    volume: rawMarket.poolUsd,
    endDate: new Date(rawMarket.closesAt || new Date()),
    outcomes: rawMarket.outcomes.map(outcome => ({
      name: outcome.label,
      probability: outcome.oddsPct,
      volume: Math.round(rawMarket.poolUsd * (outcome.oddsPct / 100)),
      price: {
        yes: Math.round(outcome.oddsPct),
        no: Math.round(100 - outcome.oddsPct)
      }
    })),
    relatedMarkets: getRelatedMarkets(rawMarket.id)
  };

  // Only add uiStyle if it's defined to avoid undefined assignment
  const normalizedStyle = normalizeUiStyle(uiStyle);
  if (normalizedStyle) {
    market.uiStyle = normalizedStyle;
  }

  return market;
};

/**
 * Get related markets for a given market ID
 * @param marketId - The current market ID
 * @returns Array of related markets
 */
export const getRelatedMarkets = (marketId: string): RelatedMarket[] => {
  // For now, return mock related markets
  // In a real app, this would fetch from an API based on the market ID
  return [
    {
      id: "1",
      title: "Will the Democratic candidate win the 2025 NYC mayoral election?",
      probability: 90,
      volume: 15000000
    },
    {
      id: "2", 
      title: "Will Andrew Cuomo win second place in the 2025 NYC mayoral election?",
      probability: 85,
      volume: 8000000
    }
  ];
};

/**
 * Calculate total market volume from outcomes
 * @param outcomes - Array of market outcomes
 * @returns Total volume
 */
export const calculateMarketVolume = (outcomes: Outcome[]): number => {
  return outcomes.reduce((total, outcome) => total + outcome.volume, 0);
};

/**
 * Calculate market liquidity (total volume / number of outcomes)
 * @param outcomes - Array of market outcomes
 * @returns Average liquidity per outcome
 */
export const calculateMarketLiquidity = (outcomes: Outcome[]): number => {
  if (outcomes.length === 0) return 0;
  return calculateMarketVolume(outcomes) / outcomes.length;
};

/**
 * Get market status based on end date
 * @param endDate - Market end date
 * @returns Market status string
 */
export const getMarketStatus = (endDate: Date): 'open' | 'closing-soon' | 'closed' => {
  const now = new Date();
  const timeDiff = endDate.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  if (hoursDiff <= 0) return 'closed';
  if (hoursDiff <= 24) return 'closing-soon';
  return 'open';
};

/**
 * Format market end date for display
 * @param endDate - Market end date
 * @returns Formatted date string
 */
export const formatMarketEndDate = (endDate: Date): string => {
  return endDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Get time remaining until market closes
 * @param endDate - Market end date
 * @returns Time remaining string
 */
export const getTimeRemaining = (endDate: Date): string => {
  const now = new Date();
  const timeDiff = endDate.getTime() - now.getTime();
  
  if (timeDiff <= 0) return 'Closed';
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Check if market is still tradeable
 * @param endDate - Market end date
 * @returns True if market is still open for trading
 */
export const isMarketTradeable = (endDate: Date): boolean => {
  return getMarketStatus(endDate) === 'open';
};

/**
 * Get market statistics
 * @param market - Market object
 * @returns Market statistics
 */
export const getMarketStats = (market: Market) => {
  const totalVolume = calculateMarketVolume(market.outcomes);
  const liquidity = calculateMarketLiquidity(market.outcomes);
  const status = getMarketStatus(market.endDate);
  const timeRemaining = getTimeRemaining(market.endDate);
  
  return {
    totalVolume,
    liquidity,
    status,
    timeRemaining,
    isTradeable: isMarketTradeable(market.endDate),
    outcomeCount: market.outcomes.length
  };
};

/**
 * Search markets by title
 * @param query - Search query
 * @returns Array of matching markets
 */
export const searchMarkets = (query: string): Market[] => {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase();
  return mockMarkets
    .filter(market => 
      market.question.toLowerCase().includes(searchTerm) ||
      market.outcomes.some(outcome => 
        outcome.label.toLowerCase().includes(searchTerm)
      )
    )
    .map(transformMarketData);
};

/**
 * Get markets by category
 * @param category - Category to filter by
 * @returns Array of markets in the category
 */
export const getMarketsByCategory = (category: string): Market[] => {
  // For now, return all markets since we don't have category data in mock
  // In a real app, this would filter by actual category
  return mockMarkets.map(transformMarketData);
};

/**
 * Get trending markets (highest volume)
 * @param limit - Maximum number of markets to return
 * @returns Array of trending markets
 */
export const getTrendingMarkets = (limit: number = 10): Market[] => {
  return mockMarkets
    .sort((a, b) => b.poolUsd - a.poolUsd)
    .slice(0, limit)
    .map(transformMarketData);
};
