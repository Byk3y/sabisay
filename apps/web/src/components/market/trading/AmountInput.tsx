/**
 * Amount Input Component
 * Responsive input component for trade amount
 * Mobile: Centered input with +/- buttons
 * Desktop: Right-aligned input with label
 */

import React, { memo, useCallback } from 'react';
import { getTradeAmountFontSize } from '@/lib/tradingUtils';
import { useAmountInput } from '@/hooks/useAmountInput';

interface AmountInputProps {
  tradeAmount: string;
  onAmountChange: (amount: string) => void;
}

/**
 * Amount input component with responsive design
 * @param props - Component props
 * @returns JSX element
 */
const AmountInputComponent = ({
  tradeAmount,
  onAmountChange
}: AmountInputProps) => {
  const {
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
  } = useAmountInput();

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e.target.value, onAmountChange);
  }, [handleChange, onAmountChange]);

  const handleIncrementClick = useCallback(() => {
    handleIncrement(tradeAmount, onAmountChange);
  }, [handleIncrement, tradeAmount, onAmountChange]);

  const handleDecrementClick = useCallback(() => {
    handleDecrement(tradeAmount, onAmountChange);
  }, [handleDecrement, tradeAmount, onAmountChange]);

  const handleFocusEvent = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    handleFocus();
  }, [handleFocus]);

  const handleBlurEvent = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    handleBlur();
  }, [handleBlur]);

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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          {/* Amount Display - Centered */}
          <div className="text-center flex-1 mx-4">
            <input
              type="text"
              value={tradeAmount ? formatDisplayValue(tradeAmount) : ''}
              onChange={handleAmountChange}
              onFocus={handleFocusEvent}
              onBlur={handleBlurEvent}
              onKeyDown={handleKeyDown}
              onClick={handleClick}
              onSelect={handleSelect}
              placeholder="$0"
              className="w-full text-4xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none text-center placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          
          {/* Plus Button - Far Right */}
          <button
            onClick={handleIncrementClick}
            className="w-10 h-10 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop: Right-aligned input with label */}
      <div className="hidden md:block mb-1">
        <div className="relative text-right overflow-hidden whitespace-nowrap h-16 flex items-center justify-between">
          <label className="text-base font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">
            Amount
          </label>
          <div className="flex items-center justify-end relative min-w-0" style={{ flex: '1 1 0%' }}>
            <input
              type="text"
              value={tradeAmount ? formatDisplayValue(tradeAmount) : ''}
              onChange={handleAmountChange}
              onFocus={handleFocusEvent}
              onBlur={handleBlurEvent}
              onKeyDown={handleKeyDown}
              onClick={handleClick}
              onSelect={handleSelect}
              placeholder="$0"
              className="w-full bg-transparent border-none outline-none font-bold text-right text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              style={{ fontSize: getTradeAmountFontSize(tradeAmount) }}
            />
          </div>
        </div>
        
        {/* Desktop Quick Add Pills */}
        <div className="flex gap-2 justify-end mt-2">
          <button
            onClick={() => {
              const currentAmount = parseFloat(tradeAmount) || 0;
              const newAmount = currentAmount + 1;
              onAmountChange(newAmount.toString());
            }}
            className="px-3 py-1 text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            +$1
          </button>
          <button
            onClick={() => {
              const currentAmount = parseFloat(tradeAmount) || 0;
              const newAmount = currentAmount + 20;
              onAmountChange(newAmount.toString());
            }}
            className="px-3 py-1 text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            +$20
          </button>
          <button
            onClick={() => {
              const currentAmount = parseFloat(tradeAmount) || 0;
              const newAmount = currentAmount + 100;
              onAmountChange(newAmount.toString());
            }}
            className="px-3 py-1 text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            +$100
          </button>
          <button
            onClick={() => {
              onAmountChange("999999999");
            }}
            className="px-3 py-1 text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Max
          </button>
        </div>
      </div>
    </div>
  );
};

export const AmountInput = memo(AmountInputComponent);
