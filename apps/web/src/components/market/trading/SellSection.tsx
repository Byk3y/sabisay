/**
 * Sell Section Component
 * Desktop-only component for selling shares with receive amount calculation
 * Matches AmountInput styling and behavior exactly
 */

import React, { memo, useCallback } from 'react';
import {
  getTradeAmountFontSize,
  getSellReceiveAmountFontSize,
} from '@/lib/tradingUtils';
import { useAmountInput } from '@/hooks/useAmountInput';
import type { Outcome } from '@/types/market';

interface SellSectionProps {
  selectedCandidate: number;
  currentOutcome: Outcome;
  shares: string;
  onSharesChange: (shares: string) => void;
}

/**
 * Sell section component for desktop
 * @param props - Component props
 * @returns JSX element
 */
const SellSectionComponent = ({
  selectedCandidate,
  currentOutcome,
  shares,
  onSharesChange,
}: SellSectionProps) => {
  const {
    isInputFocused,
    handleFocus,
    handleBlur,
    handleChange,
    handleIncrement,
    handleDecrement,
  } = useAmountInput();

  // Custom formatting for shares (no $ symbol)
  const formatSharesValue = useCallback((shares: string) => {
    if (!shares) return '';
    return parseFloat(shares).toLocaleString();
  }, []);

  // Custom handlers for shares (no cursor protection needed since no $ symbol)
  const handleSharesKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow normal keyboard navigation for shares
    },
    []
  );

  const handleSharesClick = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      // Allow normal click behavior for shares
    },
    []
  );

  const handleSharesSelect = useCallback(
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      // Allow normal selection behavior for shares
    },
    []
  );

  const currentPrice =
    selectedCandidate === 0
      ? currentOutcome.price.yes
      : currentOutcome.price.no;
  const sharesNumber = parseFloat(shares) || 0;
  const receiveAmount = sharesNumber * (currentPrice / 100); // Convert cents to dollars

  const handleSharesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e.target.value, onSharesChange);
    },
    [handleChange, onSharesChange]
  );

  const handleIncrementClick = useCallback(() => {
    handleIncrement(shares, onSharesChange);
  }, [handleIncrement, shares, onSharesChange]);

  const handleDecrementClick = useCallback(() => {
    handleDecrement(shares, onSharesChange);
  }, [handleDecrement, shares, onSharesChange]);

  const handleFocusEvent = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      handleFocus();
    },
    [handleFocus]
  );

  const handleBlurEvent = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      handleBlur();
    },
    [handleBlur]
  );

  const handleQuickPercentage = useCallback(
    (percentage: number) => {
      // Assuming user has 100 shares total for demo purposes
      const totalShares = 100;
      const newShares = Math.floor(totalShares * (percentage / 100));
      onSharesChange(newShares.toString());
    },
    [onSharesChange]
  );

  const handleMaxShares = useCallback(() => {
    // Assuming user has 100 shares total for demo purposes
    onSharesChange('100');
  }, [onSharesChange]);

  const formattedReceiveAmount = receiveAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="mb-3">
      {/* Mobile: Centered input with +/- buttons */}
      <div className="block md:hidden mb-2">
        <div className="flex items-center justify-between mb-2">
          {/* Minus Button - Far Left */}
          <button
            onClick={handleDecrementClick}
            className="w-10 h-10 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>

          {/* Shares Display - Centered */}
          <div className="text-center flex-1 mx-4">
            <input
              type="text"
              value={shares ? formatSharesValue(shares) : ''}
              onChange={handleSharesChange}
              onFocus={handleFocusEvent}
              onBlur={handleBlurEvent}
              onKeyDown={handleSharesKeyDown}
              onClick={handleSharesClick}
              onSelect={handleSharesSelect}
              placeholder="0"
              className="w-full text-4xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none text-center placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Plus Button - Far Right */}
          <button
            onClick={handleIncrementClick}
            className="w-10 h-10 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop: Shares Input - matches AmountInput styling */}
      <div className="hidden md:block mb-1">
        <div className="relative text-right overflow-hidden whitespace-nowrap h-16 flex items-center justify-between">
          <label className="text-base font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">
            Shares
          </label>
          <div
            className="flex items-center justify-end relative min-w-0"
            style={{ flex: '1 1 0%' }}
          >
            <input
              type="text"
              value={shares ? formatSharesValue(shares) : ''}
              onChange={handleSharesChange}
              onFocus={handleFocusEvent}
              onBlur={handleBlurEvent}
              onKeyDown={handleSharesKeyDown}
              onClick={handleSharesClick}
              onSelect={handleSharesSelect}
              placeholder="0"
              className="w-full bg-transparent border-none outline-none font-bold text-right text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              style={{ fontSize: getTradeAmountFontSize(shares) }}
            />
          </div>
        </div>
      </div>

      {/* Quick percentage buttons - horizontally aligned to the right - Desktop only */}
      <div className="hidden md:flex gap-2 justify-end mb-4">
        <button
          onClick={() => handleQuickPercentage(25)}
          className="px-3 py-1 text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          25%
        </button>
        <button
          onClick={() => handleQuickPercentage(50)}
          className="px-3 py-1 text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          50%
        </button>
        <button
          onClick={handleMaxShares}
          className="px-3 py-1 text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Max
        </button>
      </div>

      {/* You'll Receive Section - matches ToWinSection styling */}
      {shares && sharesNumber > 0 && (
        <div className="mb-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-300">
          {/* Mobile layout - centered, matches ToWinSection mobile */}
          <div className="block md:hidden text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
              </svg>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                You'll receive
              </span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              ${formattedReceiveAmount}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Avg. Price {currentPrice}¢
            </div>
          </div>

          {/* Desktop layout - right aligned, matches ToWinSection */}
          <div className="hidden md:flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 text-base font-semibold mb-1">
                <span>You'll receive</span>
                <span>💰</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 font-medium">
                <span>Avg. Price {currentPrice}¢</span>
                <div className="w-3 h-3 rounded-full border border-gray-400 flex items-center justify-center">
                  <span className="text-[8px]">?</span>
                </div>
              </div>
            </div>
            <div className="text-right min-w-[140px] flex justify-end">
              <div
                className="font-bold text-green-600 dark:text-green-400 h-12 flex items-center justify-end"
                style={{
                  fontSize: getSellReceiveAmountFontSize(receiveAmount),
                }}
              >
                ${formattedReceiveAmount}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SellSection = memo(SellSectionComponent);
