/**
 * Event Handler Utilities
 * Centralized event handlers for trading interface
 */

import {
  formatTradeAmount,
  parseTradeAmount,
  validateAmount,
} from './inputUtils';
import type { TradeData } from '@/types/market';

/**
 * Handles amount input change events
 * @param value - Raw input value
 * @param onAmountChange - Callback to update amount
 */
export const handleAmountChange = (
  value: string,
  onAmountChange: (amount: string) => void
): void => {
  const parsed = parseTradeAmount(value);
  if (validateAmount(parsed)) {
    onAmountChange(parsed);
  }
};

/**
 * Handles quick add button clicks
 * @param amountToAdd - Amount to add to current amount
 * @param currentAmount - Current trade amount
 * @param onAmountChange - Callback to update amount
 */
export const handleQuickAdd = (
  amountToAdd: number,
  currentAmount: string,
  onAmountChange: (amount: string) => void
): void => {
  const current = parseFloat(currentAmount) || 0;
  const newAmount = current + amountToAdd;
  if (validateAmount(newAmount.toString())) {
    onAmountChange(newAmount.toString());
  }
};

/**
 * Handles trade execution
 * @param tradeData - Complete trade data
 * @param onTrade - Callback to execute trade
 */
export const handleTrade = (
  tradeData: TradeData,
  onTrade: (tradeData: TradeData) => void
): void => {
  // Validate trade data before executing
  if (validateTradeData(tradeData)) {
    onTrade(tradeData);
  }
};

/**
 * Handles candidate selection
 * @param candidateIndex - Index of selected candidate
 * @param onCandidateSelect - Callback to update candidate
 */
export const handleCandidateSelect = (
  candidateIndex: number,
  onCandidateSelect: (candidate: number) => void
): void => {
  if (candidateIndex >= 0 && candidateIndex <= 1) {
    onCandidateSelect(candidateIndex);
  }
};

/**
 * Handles outcome selection
 * @param outcomeIndex - Index of selected outcome
 * @param onOutcomeSelect - Callback to update outcome
 */
export const handleOutcomeSelect = (
  outcomeIndex: number,
  onOutcomeSelect: (outcome: number) => void
): void => {
  if (outcomeIndex >= 0) {
    onOutcomeSelect(outcomeIndex);
  }
};

/**
 * Handles trade type change
 * @param tradeType - New trade type
 * @param onTradeTypeChange - Callback to update trade type
 */
export const handleTradeTypeChange = (
  tradeType: 'buy' | 'sell',
  onTradeTypeChange: (type: 'buy' | 'sell') => void
): void => {
  if (tradeType === 'buy' || tradeType === 'sell') {
    onTradeTypeChange(tradeType);
  }
};

/**
 * Handles order type change
 * @param orderType - New order type
 * @param onOrderTypeChange - Callback to update order type
 */
export const handleOrderTypeChange = (
  orderType: 'market' | 'limit',
  onOrderTypeChange: (type: 'market' | 'limit') => void
): void => {
  if (orderType === 'market' || orderType === 'limit') {
    onOrderTypeChange(orderType);
  }
};

/**
 * Handles limit price change
 * @param price - New limit price
 * @param onLimitPriceChange - Callback to update limit price
 */
export const handleLimitPriceChange = (
  price: string,
  onLimitPriceChange: (price: string) => void
): void => {
  const parsed = parseTradeAmount(price);
  if (validateAmount(parsed) && parseFloat(parsed) <= 100) {
    onLimitPriceChange(parsed);
  }
};

/**
 * Handles shares change
 * @param shares - New shares amount
 * @param onSharesChange - Callback to update shares
 */
export const handleSharesChange = (
  shares: string,
  onSharesChange: (shares: string) => void
): void => {
  const parsed = parseTradeAmount(shares);
  if (validateAmount(parsed) && parseFloat(parsed) <= 1000000) {
    onSharesChange(parsed);
  }
};

/**
 * Validates complete trade data
 * @param tradeData - Trade data to validate
 * @returns True if trade data is valid
 */
export const validateTradeData = (tradeData: TradeData): boolean => {
  const { amount, type, candidate, outcome, orderType } = tradeData;

  // Validate required fields
  if (
    !amount ||
    !type ||
    candidate === undefined ||
    outcome === undefined ||
    !orderType
  ) {
    return false;
  }

  // Validate amount
  if (!validateAmount(amount)) {
    return false;
  }

  // Validate candidate
  if (candidate < 0 || candidate > 1) {
    return false;
  }

  // Validate outcome
  if (outcome < 0) {
    return false;
  }

  // Validate trade type
  if (type !== 'buy' && type !== 'sell') {
    return false;
  }

  // Validate order type
  if (orderType !== 'market' && orderType !== 'limit') {
    return false;
  }

  return true;
};
