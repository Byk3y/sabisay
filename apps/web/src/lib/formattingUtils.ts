/**
 * Formatting utility functions
 * Extracted from page.tsx for better organization and reusability
 */

/**
 * Format a number as currency with proper locale formatting
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Format a number as currency without the dollar sign
 * @param amount - The amount to format
 * @returns Formatted currency string without $ (e.g., "1,234.56")
 */
export const formatCurrencyNoSymbol = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) {
    return '0.00';
  }
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Format a date for display
 * @param date - The date to format
 * @returns Formatted date string (e.g., "Dec 25, 2024")
 */
export const formatDate = (date: Date | undefined | null): string => {
  if (!date) {
    return 'TBD';
  }

  // Ensure it's a Date object
  const dateObj = date instanceof Date ? date : new Date(date);

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'TBD';
  }

  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format a number as percentage
 * @param value - The value to format (0-100)
 * @returns Formatted percentage string (e.g., "88.5%")
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Format a number as percentage without the % symbol
 * @param value - The value to format (0-100)
 * @returns Formatted percentage string without % (e.g., "88.5")
 */
export const formatPercentageNoSymbol = (value: number): string => {
  return value.toFixed(1);
};

/**
 * Format a large number with appropriate suffixes (K, M, B)
 * @param num - The number to format
 * @returns Formatted number string (e.g., "1.2M", "500K")
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
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
 * Clean and validate trade amount input
 * @param input - Raw input string
 * @returns Cleaned numeric string
 */
export const cleanTradeAmount = (input: string): string => {
  // Remove all non-numeric characters except decimal point
  const cleaned = input.replace(/[^0-9.]/g, '');
  // Ensure only one decimal point
  return cleaned.replace(/(\..*?)\./g, '$1');
};

/**
 * Validate if a trade amount is within acceptable limits
 * @param amount - The amount to validate
 * @returns True if valid, false otherwise
 */
export const validateTradeAmount = (amount: string): boolean => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) return false;
  // Check if the number of digits (excluding decimal) is within limit
  const digitsOnly = amount.replace(/\./g, '');
  return digitsOnly.length <= 9;
};
