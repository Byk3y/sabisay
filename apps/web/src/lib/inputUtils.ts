/**
 * Input Formatting Utilities
 * Centralized utilities for input formatting, parsing, and validation
 */

/**
 * Formats a trade amount for display
 * @param amount - The amount to format
 * @returns Formatted amount string with $ prefix and commas
 */
export const formatTradeAmount = (amount: string | number): string => {
  if (!amount) return '$0';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '$0';
  return `$${numAmount.toLocaleString()}`;
};

/**
 * Parses a trade amount from user input
 * @param input - Raw input string from user
 * @returns Parsed amount as string
 */
export const parseTradeAmount = (input: string): string => {
  // Remove all non-numeric characters except decimal point
  const cleaned = input.replace(/[^0-9.]/g, '');

  // Handle multiple decimal points
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }

  return cleaned;
};

/**
 * Validates if an amount is within acceptable limits
 * @param amount - Amount to validate
 * @returns True if amount is valid
 */
export const validateAmount = (amount: string | number): boolean => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return false;
  return numAmount >= 0 && numAmount <= 999999999;
};

/**
 * Sanitizes user input to prevent XSS and other issues
 * @param input - Raw input string
 * @returns Sanitized input string
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim() // Remove leading/trailing whitespace
    .slice(0, 20); // Limit length
};

/**
 * Formats a number with proper decimal places for currency
 * @param amount - Amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  decimals: number = 2
): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Formats a percentage value
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formats a price value for display
 * @param price - Price value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted price string with ¢ suffix
 */
export const formatPrice = (price: number, decimals: number = 1): string => {
  return `${price.toFixed(decimals)}¢`;
};
