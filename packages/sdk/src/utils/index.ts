// Utility functions for SabiSay SDK

/**
 * Format currency for Nigerian users
 */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
}

/**
 * Format USDC amount
 */
export function formatUSDC(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert odds to percentage
 */
export function oddsToPercentage(odds: number): number {
  return Math.round(odds * 100);
}

/**
 * Calculate potential payout
 */
export function calculatePayout(stake: number, odds: number): number {
  return stake / odds;
}

/**
 * Calculate slippage-adjusted amount
 */
export function calculateSlippageAmount(amount: number, slippage: number): number {
  return amount * (1 - slippage / 100);
}

/**
 * Validate market ID format
 */
export function isValidMarketId(marketId: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(marketId);
}

/**
 * Calculate deadline timestamp
 */
export function calculateDeadline(minutes: number = 20): number {
  return Math.floor(Date.now() / 1000) + (minutes * 60);
}
