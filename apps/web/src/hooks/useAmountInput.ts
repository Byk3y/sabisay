/**
 * useAmountInput Hook
 * Handles trade amount input formatting, validation, and focus states
 * Fixes the $ sign bug and provides consistent input behavior
 */

import { useState, useCallback } from 'react';
import {
  cleanTradeAmountInput,
  isTradeAmountWithinLimits,
} from '@/lib/tradingUtils';

export interface UseAmountInputReturn {
  // State
  isInputFocused: boolean;

  // Actions
  handleFocus: () => void;
  handleBlur: () => void;
  handleChange: (
    value: string,
    onAmountChange: (amount: string) => void
  ) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleClick: (e: React.MouseEvent<HTMLInputElement>) => void;
  handleSelect: (e: React.SyntheticEvent<HTMLInputElement>) => void;
  handleIncrement: (
    currentAmount: string,
    onAmountChange: (amount: string) => void
  ) => void;
  handleDecrement: (
    currentAmount: string,
    onAmountChange: (amount: string) => void
  ) => void;

  // Formatters
  formatDisplayValue: (amount: string) => string;
  getRawValue: (amount: string) => string;
}

/**
 * Hook for managing trade amount input with proper formatting and validation
 * @returns Object containing state and handlers for amount input
 */
export const useAmountInput = (): UseAmountInputReturn => {
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setIsInputFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsInputFocused(false);
  }, []);

  const handleChange = useCallback(
    (value: string, onAmountChange: (amount: string) => void) => {
      // Remove $ sign and other non-numeric characters except decimal point
      const rawValue = value.replace(/[^0-9.]/g, '');
      if (isTradeAmountWithinLimits(rawValue)) {
        onAmountChange(rawValue);
      }
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent cursor from moving before the $ symbol
      const input = e.target as HTMLInputElement;
      const cursorPosition = input.selectionStart || 0;

      // If user presses left arrow and cursor is at or would move to position 0 (before $)
      if (e.key === 'ArrowLeft' && cursorPosition <= 1) {
        e.preventDefault();
        // Move cursor to after the $ symbol (position 1)
        setTimeout(() => {
          input.setSelectionRange(1, 1);
        }, 0);
      }

      // If user presses backspace and cursor is at position 0 (before $)
      if (e.key === 'Backspace' && cursorPosition === 0) {
        e.preventDefault();
        // Move cursor to after the $ symbol
        setTimeout(() => {
          input.setSelectionRange(1, 1);
        }, 0);
      }
    },
    []
  );

  const handleClick = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    // Prevent cursor from being placed before the $ symbol
    const input = e.target as HTMLInputElement;

    // Use setTimeout to check cursor position after the click event
    setTimeout(() => {
      const cursorPosition = input.selectionStart || 0;
      if (cursorPosition === 0) {
        // Move cursor to after the $ symbol
        input.setSelectionRange(1, 1);
      }
    }, 0);
  }, []);

  const handleSelect = useCallback(
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      // Prevent cursor from being placed before the $ symbol
      const input = e.target as HTMLInputElement;

      // Use setTimeout to check cursor position after the selection event
      setTimeout(() => {
        const cursorPosition = input.selectionStart || 0;
        if (cursorPosition === 0) {
          // Move cursor to after the $ symbol
          input.setSelectionRange(1, 1);
        }
      }, 0);
    },
    []
  );

  const handleIncrement = useCallback(
    (currentAmount: string, onAmountChange: (amount: string) => void) => {
      const current = parseFloat(currentAmount) || 0;
      const newAmount = current + 1;
      if (isTradeAmountWithinLimits(newAmount.toString())) {
        onAmountChange(newAmount.toString());
      }
    },
    []
  );

  const handleDecrement = useCallback(
    (currentAmount: string, onAmountChange: (amount: string) => void) => {
      const current = parseFloat(currentAmount) || 0;
      const newAmount = Math.max(0, current - 1);
      onAmountChange(newAmount.toString());
    },
    []
  );

  const formatDisplayValue = useCallback((amount: string) => {
    if (!amount) return '';
    return `$${parseFloat(amount).toLocaleString()}`;
  }, []);

  const getRawValue = useCallback((amount: string) => {
    return amount || '';
  }, []);

  return {
    isInputFocused,
    handleFocus,
    handleBlur,
    handleChange,
    handleKeyDown,
    handleClick,
    handleSelect,
    handleIncrement,
    handleDecrement,
    formatDisplayValue,
    getRawValue,
  };
};
