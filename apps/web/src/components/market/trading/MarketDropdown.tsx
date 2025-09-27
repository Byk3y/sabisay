/**
 * Market Toggle Component
 * Mobile-only toggle button for Market/Limit order type selection
 * Instantly switches between Market and Limit when clicked
 */

import React from 'react';
import type { OrderType } from '@/types/market';

interface MarketDropdownProps {
  orderType: OrderType;
  onOrderTypeChange: (type: OrderType) => void;
}

export const MarketDropdown: React.FC<MarketDropdownProps> = ({
  orderType,
  onOrderTypeChange,
}) => {
  const handleToggle = () => {
    onOrderTypeChange(orderType === 'market' ? 'limit' : 'market');
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    >
      <span className="font-semibold">
        {orderType === 'market' ? 'Market' : 'Limit'}
      </span>
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    </button>
  );
};
