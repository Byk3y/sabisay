/**
 * Validation Utilities
 * Centralized validation functions for trading interface
 */

import type { TradeData, Market, Outcome } from '@/types/market';

/**
 * Validates if a trade amount is within acceptable limits
 * @param amount - Amount to validate
 * @returns Validation result with error message if invalid
 */
export const validateTradeAmount = (
  amount: string | number
): { isValid: boolean; error?: string } => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }

  if (numAmount < 0) {
    return { isValid: false, error: 'Amount cannot be negative' };
  }

  if (numAmount === 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }

  if (numAmount > 999999999) {
    return { isValid: false, error: 'Amount exceeds maximum limit' };
  }

  return { isValid: true };
};

/**
 * Validates if a limit price is within acceptable range
 * @param price - Price to validate
 * @returns Validation result with error message if invalid
 */
export const validateLimitPrice = (
  price: string | number
): { isValid: boolean; error?: string } => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return { isValid: false, error: 'Price must be a valid number' };
  }

  if (numPrice <= 0) {
    return { isValid: false, error: 'Price must be greater than 0' };
  }

  if (numPrice > 100) {
    return { isValid: false, error: 'Price cannot exceed 100¢' };
  }

  return { isValid: true };
};

/**
 * Validates if a shares amount is within acceptable range
 * @param shares - Shares to validate
 * @returns Validation result with error message if invalid
 */
export const validateShares = (
  shares: string | number
): { isValid: boolean; error?: string } => {
  const numShares = typeof shares === 'string' ? parseFloat(shares) : shares;

  if (isNaN(numShares)) {
    return { isValid: false, error: 'Shares must be a valid number' };
  }

  if (numShares <= 0) {
    return { isValid: false, error: 'Shares must be greater than 0' };
  }

  if (numShares > 1000000) {
    return { isValid: false, error: 'Shares exceed maximum limit' };
  }

  return { isValid: true };
};

/**
 * Validates if a candidate index is valid
 * @param candidate - Candidate index to validate
 * @returns Validation result with error message if invalid
 */
export const validateCandidate = (
  candidate: number
): { isValid: boolean; error?: string } => {
  if (candidate < 0 || candidate > 1) {
    return { isValid: false, error: 'Invalid candidate selection' };
  }

  return { isValid: true };
};

/**
 * Validates if an outcome index is valid
 * @param outcome - Outcome index to validate
 * @param market - Market containing the outcomes
 * @returns Validation result with error message if invalid
 */
export const validateOutcome = (
  outcome: number,
  market: Market
): { isValid: boolean; error?: string } => {
  if (outcome < 0 || outcome >= market.outcomes.length) {
    return { isValid: false, error: 'Invalid outcome selection' };
  }

  return { isValid: true };
};

/**
 * Validates complete trade data
 * @param tradeData - Trade data to validate
 * @param market - Market for context validation
 * @returns Validation result with error message if invalid
 */
export const validateTradeData = (
  tradeData: TradeData,
  market: Market
): { isValid: boolean; error?: string } => {
  const { amount, type, candidate, outcome, orderType } = tradeData;

  // Validate required fields
  if (
    !amount ||
    !type ||
    candidate === undefined ||
    outcome === undefined ||
    !orderType
  ) {
    return { isValid: false, error: 'Missing required trade data' };
  }

  // Validate amount
  const amountValidation = validateTradeAmount(amount);
  if (!amountValidation.isValid) {
    return amountValidation;
  }

  // Validate candidate
  const candidateValidation = validateCandidate(candidate);
  if (!candidateValidation.isValid) {
    return candidateValidation;
  }

  // Validate outcome
  const outcomeValidation = validateOutcome(outcome, market);
  if (!outcomeValidation.isValid) {
    return outcomeValidation;
  }

  // Validate trade type
  if (type !== 'buy' && type !== 'sell') {
    return { isValid: false, error: 'Invalid trade type' };
  }

  // Validate order type
  if (orderType !== 'market' && orderType !== 'limit') {
    return { isValid: false, error: 'Invalid order type' };
  }

  // Validate limit order specific fields
  if (orderType === 'limit') {
    if (!tradeData.limitPrice) {
      return {
        isValid: false,
        error: 'Limit price is required for limit orders',
      };
    }

    const priceValidation = validateLimitPrice(tradeData.limitPrice);
    if (!priceValidation.isValid) {
      return priceValidation;
    }

    if (!tradeData.shares) {
      return { isValid: false, error: 'Shares are required for limit orders' };
    }

    const sharesValidation = validateShares(tradeData.shares);
    if (!sharesValidation.isValid) {
      return sharesValidation;
    }
  }

  return { isValid: true };
};

/**
 * Sanitizes user input to prevent XSS and other security issues
 * @param input - Raw input string
 * @returns Sanitized input string
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim() // Remove leading/trailing whitespace
    .slice(0, 100); // Limit length
};

/**
 * Validates if a market is in a tradeable state
 * @param market - Market to validate
 * @returns Validation result with error message if invalid
 */
export const validateMarketTradeable = (
  market: Market
): { isValid: boolean; error?: string } => {
  // Check if market has valid outcomes
  if (!market.outcomes || market.outcomes.length === 0) {
    return { isValid: false, error: 'Market has no valid outcomes' };
  }

  return { isValid: true };
};
