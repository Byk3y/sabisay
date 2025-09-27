/**
 * Custom hook for trading state management
 * Extracted from page.tsx for better organization and reusability
 */

import { useState } from 'react';
import type {
  UseTradingStateReturn,
  TradeType,
  OrderType,
} from '@/types/market';

/**
 * Hook for managing trading state and operations
 * @returns Trading state and operations
 */
export const useTradingState = (): UseTradingStateReturn => {
  // Trading form state
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeType, setTradeType] = useState<TradeType>('buy');
  const [selectedCandidate, setSelectedCandidate] = useState(0);
  const [selectedOutcome, setSelectedOutcome] = useState(0);
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [shares, setShares] = useState('');
  const [expirationEnabled, setExpirationEnabled] = useState(false);
  const [expirationDropdownOpen, setExpirationDropdownOpen] = useState(false);
  const [selectedExpiration, setSelectedExpiration] = useState('End of day');

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  /**
   * Reset all trading state to initial values
   */
  const resetTradingState = () => {
    setTradeAmount('');
    setTradeType('buy');
    setSelectedCandidate(0);
    setSelectedOutcome(0);
    setOrderType('market');
    setLimitPrice('');
    setShares('');
    setExpirationEnabled(false);
    setExpirationDropdownOpen(false);
    setSelectedExpiration('End of day');
    setIsMobileSidebarOpen(false);
  };

  /**
   * Handle trade amount change with validation
   * @param amount - The new trade amount
   */
  const handleTradeAmountChange = (amount: string) => {
    // Basic validation - only allow numbers and one decimal point
    const cleanAmount = amount
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*?)\./g, '$1');

    // Check if the number of digits (excluding decimal) is within limit
    const numbers = cleanAmount.replace(/\./g, '');
    if (numbers.length <= 9) {
      setTradeAmount(cleanAmount);
    }
  };

  /**
   * Handle limit price change with validation
   * @param price - The new limit price
   */
  const handleLimitPriceChange = (price: string) => {
    // Allow only numbers and one decimal point, max 100
    const cleanPrice = price
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*?)\./g, '$1');
    const numPrice = parseFloat(cleanPrice);

    if (cleanPrice === '' || (numPrice >= 0 && numPrice <= 100)) {
      setLimitPrice(cleanPrice);
    }
  };

  /**
   * Handle shares change with validation
   * @param shareCount - The new number of shares
   */
  const handleSharesChange = (shareCount: string) => {
    // Allow only whole numbers
    const cleanShares = shareCount.replace(/[^0-9]/g, '');
    setShares(cleanShares);
  };

  /**
   * Handle candidate selection (Yes/No)
   * @param candidate - The candidate index (0 for Yes, 1 for No)
   */
  const handleCandidateSelect = (candidate: number) => {
    setSelectedCandidate(candidate);
  };

  /**
   * Handle outcome selection
   * @param outcome - The outcome index
   */
  const handleOutcomeSelect = (outcome: number) => {
    setSelectedOutcome(outcome);
  };

  /**
   * Handle both candidate and outcome selection
   * @param outcome - The outcome index
   * @param candidate - The candidate index
   */
  const handleOutcomeAndCandidateSelect = (
    outcome: number,
    candidate: number
  ) => {
    setSelectedOutcome(outcome);
    setSelectedCandidate(candidate);
  };

  /**
   * Toggle expiration enabled state
   * @param enabled - Whether expiration is enabled
   */
  const handleExpirationToggle = (enabled: boolean) => {
    setExpirationEnabled(enabled);
    if (!enabled) {
      setExpirationDropdownOpen(false);
    }
  };

  /**
   * Handle expiration selection
   * @param expiration - The selected expiration option
   */
  const handleExpirationSelect = (expiration: string) => {
    setSelectedExpiration(expiration);
    setExpirationDropdownOpen(false);
  };

  /**
   * Toggle expiration dropdown
   */
  const toggleExpirationDropdown = () => {
    setExpirationDropdownOpen(!expirationDropdownOpen);
  };

  return {
    // State
    tradeAmount,
    tradeType,
    selectedCandidate,
    selectedOutcome,
    orderType,
    limitPrice,
    shares,
    expirationEnabled,
    expirationDropdownOpen,
    selectedExpiration,
    isMobileSidebarOpen,

    // Setters
    setTradeAmount: handleTradeAmountChange,
    setTradeType,
    setSelectedCandidate: handleCandidateSelect,
    setSelectedOutcome: handleOutcomeSelect,
    setOrderType,
    setLimitPrice: handleLimitPriceChange,
    setShares: handleSharesChange,
    setExpirationEnabled: handleExpirationToggle,
    setExpirationDropdownOpen: toggleExpirationDropdown,
    setSelectedExpiration: handleExpirationSelect,
    setIsMobileSidebarOpen,

    // Additional handlers
    resetTradingState,
    handleOutcomeAndCandidateSelect,
  };
};
