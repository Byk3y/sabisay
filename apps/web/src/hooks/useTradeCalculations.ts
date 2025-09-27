/**
 * useTradeCalculations Hook
 * Centralizes all trade calculation logic including potential wins, fees, and totals
 */

import { useMemo } from 'react';
import {
  calculatePotentialWin,
  calculateTotal,
  calculateLimitWin,
} from '@/lib/tradingUtils';
import type { Market, Outcome } from '@/types/market';

export interface UseTradeCalculationsProps {
  market: Market;
  selectedOutcome: number;
  selectedCandidate: number;
  tradeAmount: string;
  limitPrice?: string;
  shares?: string;
}

export interface UseTradeCalculationsReturn {
  // Current market data
  currentOutcome: Outcome | undefined;
  currentPrice: number;

  // Calculations
  potentialWin: number;
  totalCost: number;
  limitWin: number;

  // Formatted values
  formattedPotentialWin: string;
  formattedTotalCost: string;
  formattedLimitWin: string;

  // Validation
  isValidAmount: boolean;
  isValidLimitPrice: boolean;
  isValidShares: boolean;
}

/**
 * Hook for calculating trade-related values and validating inputs
 * @param props - Trade calculation parameters
 * @returns Object containing calculated values and validation states
 */
export const useTradeCalculations = ({
  market,
  selectedOutcome,
  selectedCandidate,
  tradeAmount,
  limitPrice,
  shares,
}: UseTradeCalculationsProps): UseTradeCalculationsReturn => {
  const currentOutcome = market.outcomes[selectedOutcome];
  const currentPrice =
    selectedCandidate === 0
      ? currentOutcome?.price.yes
      : currentOutcome?.price.no;

  // Calculate potential win
  const potentialWin = useMemo(() => {
    if (!tradeAmount || !currentPrice) return 0;
    return calculatePotentialWin(parseFloat(tradeAmount), currentPrice);
  }, [tradeAmount, currentPrice]);

  // Calculate total cost
  const totalCost = useMemo(() => {
    if (!tradeAmount) return 0;
    return calculateTotal(parseFloat(tradeAmount), 1); // Assuming 1 share for total cost calculation
  }, [tradeAmount]);

  // Calculate limit win
  const limitWin = useMemo(() => {
    if (!limitPrice || !shares) return 0;
    return calculateLimitWin(parseFloat(shares), parseFloat(limitPrice));
  }, [limitPrice, shares]);

  // Format values
  const formattedPotentialWin = useMemo(() => {
    return potentialWin.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [potentialWin]);

  const formattedTotalCost = useMemo(() => {
    return totalCost.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [totalCost]);

  const formattedLimitWin = useMemo(() => {
    return limitWin.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [limitWin]);

  // Validation
  const isValidAmount = useMemo(() => {
    if (!tradeAmount) return false;
    const amount = parseFloat(tradeAmount);
    return amount > 0 && amount <= 999999999;
  }, [tradeAmount]);

  const isValidLimitPrice = useMemo(() => {
    if (!limitPrice) return false;
    const price = parseFloat(limitPrice);
    return price > 0 && price <= 100;
  }, [limitPrice]);

  const isValidShares = useMemo(() => {
    if (!shares) return false;
    const shareCount = parseFloat(shares);
    return shareCount > 0 && shareCount <= 1000000;
  }, [shares]);

  return {
    currentOutcome,
    currentPrice: currentPrice || 0,
    potentialWin,
    totalCost,
    limitWin,
    formattedPotentialWin,
    formattedTotalCost,
    formattedLimitWin,
    isValidAmount,
    isValidLimitPrice,
    isValidShares,
  };
};
