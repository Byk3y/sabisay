/**
 * Buy/Sell Dropdown Component
 * Mobile-only dropdown for Buy/Sell selection
 * Shows in mobile header with animated arrow
 */

import { useState } from 'react';

interface BuySellDropdownProps {
  tradeType: 'buy' | 'sell';
  onTradeTypeChange: (type: 'buy' | 'sell') => void;
}

/**
 * Buy/Sell dropdown component for mobile
 * @param props - Component props
 * @returns JSX element
 */
export const BuySellDropdown = ({
  tradeType,
  onTradeTypeChange,
}: BuySellDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (type: 'buy' | 'sell') => {
    onTradeTypeChange(type);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg"
      >
        {tradeType === 'buy' ? 'Buy' : 'Sell'}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Modal */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
          <button
            onClick={() => handleSelect('buy')}
            className="w-full px-3 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg"
          >
            Buy
          </button>
          <button
            onClick={() => handleSelect('sell')}
            className="w-full px-3 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 last:rounded-b-lg"
          >
            Sell
          </button>
        </div>
      )}
    </div>
  );
};
