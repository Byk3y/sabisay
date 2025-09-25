/**
 * Custom hook for market data management
 * Extracted from page.tsx for better organization and reusability
 */

import { useState, useEffect } from 'react';
import { getMarketById } from '@/lib/marketUtils';
import type { Market, UseMarketDataReturn } from '@/types/market';

/**
 * Hook for managing market data state and operations
 * @param marketId - The ID of the market to load
 * @returns Market data state and operations
 */
export const useMarketData = (marketId: string): UseMarketDataReturn => {
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load market data on mount or when marketId changes
  useEffect(() => {
    const loadMarket = async () => {
      setIsLoading(true);
      try {
        const marketData = getMarketById(marketId);
        setMarket(marketData);
      } catch (error) {
        console.error('Error loading market:', error);
        setMarket(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (marketId) {
      loadMarket();
    }
  }, [marketId]);

  return {
    market,
    isLoading,
    setMarket,
    setIsLoading
  };
};
