/**
 * Amount Input Component
 * Extracted from TradingSidebar for better organization
 */

import { useState } from 'react';
import { 
  cleanTradeAmountInput,
  isTradeAmountWithinLimits,
  getTradeAmountFontSize
} from '@/lib/tradingUtils';

interface AmountInputProps {
  tradeAmount: string;
  isMobile: boolean;
  onAmountChange: (amount: string) => void;
}

/**
 * Amount input component with mobile and desktop layouts
 * @param props - Component props
 * @returns JSX element
 */
export const AmountInput = ({
  tradeAmount,
  isMobile,
  onAmountChange
}: AmountInputProps) => {
  const [isMobileInputFocused, setIsMobileInputFocused] = useState(false);

  if (isMobile) {
    // Mobile layout - Centered with plus/minus buttons
    return (
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          {/* Minus Button - Far Left */}
          <button
            onClick={() => {
              const currentAmount = parseFloat(tradeAmount) || 0;
              const newAmount = Math.max(0, currentAmount - 1);
              onAmountChange(newAmount.toString());
            }}
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
              value={isMobileInputFocused ? (tradeAmount || '') : (tradeAmount ? `$${parseFloat(tradeAmount).toLocaleString()}` : '$0')}
              onChange={(e) => {
                const rawValue = cleanTradeAmountInput(e.target.value);
                if (isTradeAmountWithinLimits(rawValue)) {
                  onAmountChange(rawValue);
                }
              }}
              onFocus={() => {
                setIsMobileInputFocused(true);
              }}
              onBlur={() => {
                setIsMobileInputFocused(false);
              }}
              placeholder="$0"
              className="w-full text-4xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none text-center placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          
          {/* Plus Button - Far Right */}
          <button
            onClick={() => {
              const currentAmount = parseFloat(tradeAmount) || 0;
              const newAmount = currentAmount + 1;
              if (isTradeAmountWithinLimits(newAmount.toString())) {
                onAmountChange(newAmount.toString());
              }
            }}
            className="w-10 h-10 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Desktop layout - Right-aligned with label
  return (
    <div className="mb-1">
      <div className="relative text-right overflow-hidden whitespace-nowrap h-16 flex items-center justify-between">
        <label className="text-base font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">Amount</label>
        <div className="flex items-center justify-end relative min-w-0" style={{ flex: '1 1 0%' }}>
          <input
            type="text"
            value={tradeAmount ? `$${parseFloat(tradeAmount).toLocaleString()}` : ''}
            onChange={(e) => {
              const rawValue = cleanTradeAmountInput(e.target.value);
              if (isTradeAmountWithinLimits(rawValue)) {
                onAmountChange(rawValue);
              }
            }}
            onFocus={() => {
              const input = document.activeElement as HTMLInputElement;
              if (input && tradeAmount) {
                input.value = tradeAmount;
              }
            }}
            onBlur={() => {
              const input = document.activeElement as HTMLInputElement;
              if (input && tradeAmount) {
                input.value = `$${parseFloat(tradeAmount).toLocaleString()}`;
              }
            }}
            placeholder="$0"
            className="w-full bg-transparent border-none outline-none font-bold text-right text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            style={{ fontSize: getTradeAmountFontSize(tradeAmount) }}
          />
        </div>
      </div>
    </div>
  );
};
