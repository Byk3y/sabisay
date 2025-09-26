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
  const [isLoading, setIsLoading] = useState(true);

  // Load market data on mount or when marketId changes
  useEffect(() => {
    const loadMarket = () => {
      setIsLoading(true);
      try {
        // Use getMarketById to fetch market data
        const marketData = getMarketById(marketId);
        if (marketData) {
          setMarket(marketData);
        } else {
          console.error(`Market not found: ${marketId}`);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading market:', error);
        setIsLoading(false);
      }
    };

    if (marketId) {
      loadMarket();
    } else {
      setIsLoading(false);
    }
  }, [marketId]);

  return {
    market,
    isLoading,
    setMarket,
    setIsLoading
  };
};
