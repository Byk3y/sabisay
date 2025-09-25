/**
 * Trade formatting utilities for market trading interface
 */

/**
 * Convert percentage to cents (rounded)
 */
export function centsFromPct(pct: number): number {
  return Math.round(pct);
}

/**
 * Calculate potential winnings in dollars
 */
export function toWinDollars(amountUsd: number, priceCents: number): number {
  return Math.max(0, amountUsd - (priceCents / 100) * amountUsd);
}

/**
 * Format currency with proper locale formatting
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage with proper decimal places
 */
export function formatPercentage(pct: number): string {
  return `${pct.toFixed(1)}%`;
}

/**
 * Format cents as currency (e.g., 45 -> "45¢")
 */
export function formatCents(cents: number): string {
  return `${cents}¢`;
}
