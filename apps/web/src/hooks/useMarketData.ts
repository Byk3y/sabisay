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
        // Temporary hardcoded market for testing
        if (marketId === "6") {
          const testMarket = {
            id: "6",
            title: "Nigerian Presidential Election 2027",
            volume: 12000000,
            endDate: new Date("2027-02-25T14:00:00Z"),
            outcomes: [
              {
                name: "Peter Obi",
                probability: 45,
                volume: 5400000,
                price: { yes: 45, no: 55 }
              },
              {
                name: "Bola Tinubu", 
                probability: 38,
                volume: 4560000,
                price: { yes: 38, no: 62 }
              }
            ],
            relatedMarkets: []
          };
          setMarket(testMarket);
          setIsLoading(false);
          return;
        }
        
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
