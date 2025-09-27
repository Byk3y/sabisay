/**
 * Quick Add Buttons Component
 * Mobile-only component for quick amount addition buttons
 * Shows +$1, +$20, +$100, Max buttons
 */

import React, { memo, useCallback } from 'react';
import { isTradeAmountWithinLimits } from '@/lib/tradingUtils';

interface QuickAddButtonsProps {
  tradeAmount: string;
  onAmountChange: (amount: string) => void;
  tradeType?: 'buy' | 'sell';
  shares?: string;
  onSharesChange?: (shares: string) => void;
}

/**
 * Quick add buttons component for mobile
 * @param props - Component props
 * @returns JSX element
 */
const QuickAddButtonsComponent = ({
  tradeAmount,
  onAmountChange,
  tradeType = 'buy',
  shares,
  onSharesChange,
}: QuickAddButtonsProps) => {
  const handleQuickAdd = useCallback(
    (amount: number) => {
      const currentAmount = parseFloat(tradeAmount) || 0;
      const newAmount = currentAmount + amount;
      if (isTradeAmountWithinLimits(newAmount.toString())) {
        onAmountChange(newAmount.toString());
      }
    },
    [tradeAmount, onAmountChange]
  );

  const handleMax = useCallback(() => {
    onAmountChange('999999999');
  }, [onAmountChange]);

  // Buy mode handlers
  const handleAdd1 = useCallback(() => handleQuickAdd(1), [handleQuickAdd]);
  const handleAdd20 = useCallback(() => handleQuickAdd(20), [handleQuickAdd]);
  const handleAdd100 = useCallback(() => handleQuickAdd(100), [handleQuickAdd]);

  // Sell mode handlers (percentage-based)
  const handleQuickPercentage = useCallback(
    (percentage: number) => {
      if (!onSharesChange) return;
      // Assuming user has 100 shares total for demo purposes
      const totalShares = 100;
      const newShares = Math.floor(totalShares * (percentage / 100));
      onSharesChange(newShares.toString());
    },
    [onSharesChange]
  );

  const handleMaxShares = useCallback(() => {
    if (!onSharesChange) return;
    // Assuming user has 100 shares total for demo purposes
    onSharesChange('100');
  }, [onSharesChange]);

  if (tradeType === 'sell') {
    return (
      <div className="flex gap-2 justify-center mb-2">
        <button
          onClick={() => handleQuickPercentage(25)}
          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          25%
        </button>
        <button
          onClick={() => handleQuickPercentage(50)}
          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          50%
        </button>
        <button
          onClick={() => handleQuickPercentage(75)}
          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          75%
        </button>
        <button
          onClick={handleMaxShares}
          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Max
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 justify-center mb-2">
      <button
        onClick={handleAdd1}
        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        +$1
      </button>
      <button
        onClick={handleAdd20}
        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        +$20
      </button>
      <button
        onClick={handleAdd100}
        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        +$100
      </button>
      <button
        onClick={handleMax}
        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        Max
      </button>
    </div>
  );
};

export const QuickAddButtons = memo(QuickAddButtonsComponent);
