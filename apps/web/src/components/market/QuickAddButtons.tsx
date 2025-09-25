/**
 * Quick Add Buttons Component
 * Extracted from TradingSidebar for better organization
 */

import { isTradeAmountWithinLimits } from '@/lib/tradingUtils';

interface QuickAddButtonsProps {
  tradeAmount: string;
  isMobile: boolean;
  onAmountChange: (amount: string) => void;
}

/**
 * Quick add buttons component for incrementing trade amounts
 * @param props - Component props
 * @returns JSX element
 */
export const QuickAddButtons = ({
  tradeAmount,
  isMobile,
  onAmountChange
}: QuickAddButtonsProps) => {
  const handleAmountChange = (increment: number) => {
    const currentAmount = parseFloat(tradeAmount) || 0;
    const newAmount = currentAmount + increment;
    if (isTradeAmountWithinLimits(newAmount.toString())) {
      onAmountChange(newAmount.toString());
    }
  };

  const handleMaxAmount = () => {
    onAmountChange("999999999");
  };

  if (isMobile) {
    // Mobile layout - Centered above trade button
    return (
      <div className="flex gap-2 justify-center mb-2">
        <button
          onClick={() => handleAmountChange(1)}
          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          +$1
        </button>
        <button
          onClick={() => handleAmountChange(20)}
          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          +$20
        </button>
        <button
          onClick={() => handleAmountChange(100)}
          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          +$100
        </button>
        <button
          onClick={handleMaxAmount}
          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Max
        </button>
      </div>
    );
  }

  // Desktop layout - Right-aligned in original position
  return (
    <div className="flex gap-1.5 justify-end my-3">
      <button
        onClick={() => handleAmountChange(1)}
        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
      >
        +$1
      </button>
      <button
        onClick={() => handleAmountChange(20)}
        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
      >
        +$20
      </button>
      <button
        onClick={() => handleAmountChange(100)}
        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
      >
        +$100
      </button>
      <button
        onClick={handleMaxAmount}
        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
      >
        Max
      </button>
    </div>
  );
};
