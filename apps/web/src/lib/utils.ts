/**
 * Utility functions for the application
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncate a wallet address for display
 * @param address - The wallet address to truncate
 * @param startLength - Number of characters to show at the start (default: 6)
 * @param endLength - Number of characters to show at the end (default: 4)
 * @returns Truncated address string (e.g., "0x1234...5678")
 */
export function truncateAddress(
  address: string,
  startLength: number = 6,
  endLength: number = 4
): string {
  if (!address || address.length <= startLength + endLength) {
    return address;
  }

  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * Get initials from a wallet address
 * @param address - The wallet address
 * @returns First 2 characters of the address (e.g., "0x" -> "0x", "0x1234" -> "0x")
 */
export function getAddressInitials(address: string): string {
  if (!address) return 'U';

  // For wallet addresses, use the first 2 characters after 0x
  if (address.startsWith('0x')) {
    return address.slice(2, 4).toUpperCase() || '0x';
  }

  return address.slice(0, 2).toUpperCase();
}

/**
 * Generate a gradient color based on wallet address
 * @param address - The wallet address
 * @returns CSS gradient string
 */
export function generateAddressGradient(address: string): string {
  if (!address) return 'linear-gradient(135deg, #3B82F6, #1D4ED8)';

  // Use the last 6 characters of the address to generate colors
  const hash = address.slice(-6);
  const r = parseInt(hash.slice(0, 2), 16);
  const g = parseInt(hash.slice(2, 4), 16);
  const b = parseInt(hash.slice(4, 6), 16);

  // Create a gradient using the generated colors
  return `linear-gradient(135deg, rgb(${r}, ${g}, ${b}), rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)}))`;
}
