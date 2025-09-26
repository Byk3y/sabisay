/**
 * Trading utility functions
 * Extracted from page.tsx for better organization and reusability
 */

import type { TradeData, Outcome } from '@/types/market';

/**
 * Calculate potential win amount based on trade amount and price
 * @param amount - The trade amount in USD
 * @param price - The price as percentage (0-100)
 * @returns Potential win amount
 */
export const calculatePotentialWin = (amount: number, price: number): number => {
  if (price <= 0 || price >= 100) return 0;
  const priceDecimal = price / 100;
  return amount / priceDecimal;
};

/**
 * Calculate total cost for limit orders
 * @param price - The limit price as percentage (0-100)
 * @param shares - The number of shares
 * @returns Total cost
 */
export const calculateTotal = (price: number, shares: number): number => {
  return (price * shares) / 100;
};

/**
 * Calculate win amount for limit orders
 * @param shares - The number of shares
 * @param limitPrice - The limit price as percentage (0-100)
 * @returns Win amount
 */
export const calculateLimitWin = (shares: number, limitPrice: number): number => {
  const totalCost = calculateTotal(limitPrice, shares);
  return Math.max(0, shares - totalCost);
};

/**
 * Validate trade input
 * @param input - The input string to validate
 * @returns True if valid, false otherwise
 */
export const validateTradeInput = (input: string): boolean => {
  if (!input || input.trim() === '') return false;
  const num = parseFloat(input);
  return !isNaN(num) && num > 0;
};

/**
 * Validate limit price input
 * @param price - The price string to validate
 * @returns True if valid, false otherwise
 */
export const validateLimitPrice = (price: string): boolean => {
  if (!price || price.trim() === '') return false;
  const num = parseFloat(price);
  return !isNaN(num) && num > 0 && num <= 100;
};

/**
 * Validate shares input
 * @param shares - The shares string to validate
 * @returns True if valid, false otherwise
 */
export const validateShares = (shares: string): boolean => {
  if (!shares || shares.trim() === '') return false;
  const num = parseFloat(shares);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
};

/**
 * Get the current price for a candidate/outcome combination
 * @param outcome - The market outcome
 * @param candidate - The candidate index (0 for Yes, 1 for No)
 * @returns The current price as percentage
 */
export const getCurrentPrice = (outcome: Outcome, candidate: number): number => {
  if (candidate === 0) {
    return outcome.price.yes;
  } else {
    return outcome.price.no;
  }
};

/**
 * Calculate the average price for display
 * @param outcome - The market outcome
 * @param candidate - The candidate index (0 for Yes, 1 for No)
 * @returns The average price as percentage
 */
export const getAveragePrice = (outcome: Outcome, candidate: number): number => {
  return getCurrentPrice(outcome, candidate);
};

/**
 * Format trade amount with proper currency formatting
 * @param amount - The amount string to format
 * @returns Formatted amount string
 */
export const formatTradeAmount = (amount: string): string => {
  if (!amount) return '';
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return '';
  return `$${numAmount.toLocaleString()}`;
};

/**
 * Clean trade amount input by removing non-numeric characters
 * @param input - Raw input string
 * @returns Cleaned numeric string
 */
export const cleanTradeAmountInput = (input: string): string => {
  // Extract raw number from formatted input
  const rawValue = input.replace(/[$,]/g, '');
  const cleanValue = rawValue.replace(/[^0-9.]/g, '').replace(/(\..*?)\./g, '$1');
  return cleanValue;
};

/**
 * Check if trade amount exceeds maximum allowed
 * @param amount - The amount string to check
 * @returns True if within limits, false if exceeds
 */
export const isTradeAmountWithinLimits = (amount: string): boolean => {
  const cleanAmount = cleanTradeAmountInput(amount);
  const numbers = cleanAmount.replace(/\./g, '');
  return numbers.length <= 9;
};

/**
 * Generate trade data object for execution
 * @param tradeData - Partial trade data
 * @returns Complete trade data object
 */
export const createTradeData = (tradeData: Partial<TradeData>): TradeData => {
  return {
    amount: tradeData.amount || '',
    type: tradeData.type || 'buy',
    candidate: tradeData.candidate || 0,
    outcome: tradeData.outcome || 0,
    orderType: tradeData.orderType || 'market',
    limitPrice: tradeData.limitPrice || '',
    shares: tradeData.shares || '',
    expiration: tradeData.expiration || 'End of day'
  };
};

/**
 * Calculate dynamic font size for trade amount display
 * @param amount - The trade amount string
 * @returns CSS font size string
 */
export const getTradeAmountFontSize = (amount: string): string => {
  if (!amount) return '3rem';
  
  const length = amount.length;
  if (length <= 3) return '3rem';
  if (length <= 5) return '2.5rem';
  if (length <= 7) return '2rem';
  if (length <= 9) return '1.75rem';
  return '1.5rem';
};

/**
 * Calculate dynamic font size for potential win display
 * @param winAmount - The potential win amount
 * @returns CSS font size string
 */
export const getWinAmountFontSize = (winAmount: number): string => {
  const winString = winAmount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  const length = winString.length;
  
  if (length <= 6) return '2.75rem';
  if (length <= 8) return '2.25rem';
  if (length <= 10) return '1.875rem';
  if (length <= 12) return '1.625rem';
  return '1.375rem';
};

/**
 * Calculate dynamic font size for sell section receive amount
 * More aggressive scaling to prevent text wrapping
 * @param receiveAmount - The receive amount
 * @returns CSS font size string
 */
export const getSellReceiveAmountFontSize = (receiveAmount: number): string => {
  const receiveString = receiveAmount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  const length = receiveString.length;
  
  if (length <= 6) return '2.25rem';    // Reduced from 2.75rem
  if (length <= 8) return '1.875rem';    // Reduced from 2.25rem
  if (length <= 10) return '1.5rem';     // Reduced from 1.875rem
  if (length <= 12) return '1.25rem';    // Reduced from 1.625rem
  return '1rem';                         // Reduced from 1.375rem
};

/**
 * Get expiration options for limit orders
 * @returns Array of expiration options
 */
export const getExpirationOptions = (): string[] => {
  return [
    'End of day',
    '45 Minutes'
  ];
};

/**
 * Validate if a trade can be executed
 * @param tradeData - The trade data to validate
 * @returns Object with validation result and error message
 */
export const validateTradeExecution = (tradeData: TradeData): { isValid: boolean; error?: string } => {
  if (!tradeData.amount || !validateTradeInput(tradeData.amount)) {
    return { isValid: false, error: 'Please enter a valid trade amount' };
  }

  if (tradeData.orderType === 'limit') {
    if (!tradeData.limitPrice || !validateLimitPrice(tradeData.limitPrice)) {
      return { isValid: false, error: 'Please enter a valid limit price' };
    }
    if (!tradeData.shares || !validateShares(tradeData.shares)) {
      return { isValid: false, error: 'Please enter a valid number of shares' };
    }
  }

  return { isValid: true };
};
