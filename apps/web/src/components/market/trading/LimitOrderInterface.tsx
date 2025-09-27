/**
 * Limit Order Interface Component
 * Responsive component for limit order functionality
 * Mobile: Compact layout with essential controls
 * Desktop: Full layout with all controls
 * Includes limit price, shares, expiration settings, and calculations
 */

import {
  calculateTotal,
  calculateLimitWin,
  getExpirationOptions,
} from '@/lib/tradingUtils';
import type { Outcome } from '@/types/market';

interface LimitOrderInterfaceProps {
  selectedCandidate: number;
  currentOutcome: Outcome;
  limitPrice: string;
  shares: string;
  expirationEnabled: boolean;
  selectedExpiration: string;
  onLimitPriceChange: (price: string) => void;
  onSharesChange: (shares: string) => void;
  onExpirationToggle: (enabled: boolean) => void;
  onExpirationSelect: (expiration: string) => void;
}

/**
 * Limit order interface component for desktop
 * @param props - Component props
 * @returns JSX element
 */
export const LimitOrderInterface = ({
  selectedCandidate,
  currentOutcome,
  limitPrice,
  shares,
  expirationEnabled,
  selectedExpiration,
  onLimitPriceChange,
  onSharesChange,
  onExpirationToggle,
  onExpirationSelect,
}: LimitOrderInterfaceProps) => {
  const expirationOptions = getExpirationOptions();

  const defaultPrice =
    selectedCandidate === 0
      ? currentOutcome?.probability || 45
      : currentOutcome?.probability || 38;

  const currentLimitPrice = limitPrice || defaultPrice.toString();
  const currentShares = parseFloat(shares || '0') || 0;
  const total = calculateTotal(parseFloat(currentLimitPrice), currentShares);
  const limitWin = calculateLimitWin(
    currentShares,
    parseFloat(currentLimitPrice)
  );

  const handleLimitPriceChange = (value: string) => {
    onLimitPriceChange(value);
  };

  const handleLimitPriceIncrement = () => {
    const current = parseFloat(currentLimitPrice) || 0;
    onLimitPriceChange((current + 0.1).toFixed(1));
  };

  const handleLimitPriceDecrement = () => {
    const current = parseFloat(currentLimitPrice) || 0;
    onLimitPriceChange(Math.max(0.1, current - 0.1).toFixed(1));
  };

  const handleSharesIncrement = () => {
    const current = parseFloat(shares || '0') || 0;
    onSharesChange((current + 10).toString());
  };

  const handleSharesDecrement = () => {
    const current = parseFloat(shares || '0') || 0;
    onSharesChange(Math.max(0, current - 10).toString());
  };

  return (
    <div className="space-y-4">
      {/* Limit Price - Responsive */}
      <div className="flex items-center justify-between">
        <label className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">
          Limit Price
        </label>
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 w-32 md:w-40 h-8 md:h-10 overflow-hidden">
          <button
            onClick={handleLimitPriceDecrement}
            className="px-1 md:px-2 py-1 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 text-sm md:text-base font-semibold flex-shrink-0"
          >
            —
          </button>
          <input
            type="text"
            value={currentLimitPrice}
            onChange={e => handleLimitPriceChange(e.target.value)}
            placeholder={defaultPrice.toString()}
            className="flex-1 min-w-0 px-0 py-1 text-center bg-transparent border-none outline-none text-gray-900 dark:text-white font-bold text-sm md:text-lg"
          />
          <button
            onClick={handleLimitPriceIncrement}
            className="px-1 md:px-2 py-1 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 text-sm md:text-base font-semibold flex-shrink-0"
          >
            +
          </button>
        </div>
      </div>

      {/* Shares - Responsive */}
      <div className="flex items-start justify-between">
        <label className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100 mt-1 md:mt-2">
          Shares
        </label>
        <div className="flex flex-col items-end space-y-2">
          <input
            type="text"
            value={shares || ''}
            onChange={e => onSharesChange(e.target.value)}
            placeholder="0"
            className="w-32 md:w-40 h-8 md:h-10 px-2 md:px-3 py-1 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-center text-gray-900 dark:text-white font-semibold text-sm md:text-base outline-none focus:border-blue-500"
          />
          <div className="flex gap-1 md:gap-2">
            <button
              onClick={handleSharesDecrement}
              className="px-2 md:px-3 py-1 md:py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-xs md:text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              -10
            </button>
            <button
              onClick={handleSharesIncrement}
              className="px-2 md:px-3 py-1 md:py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-xs md:text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              +10
            </button>
          </div>
        </div>
      </div>

      {/* Set Expiration - Responsive */}
      <div>
        <div className="flex items-center justify-between py-2 md:py-3">
          <span className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">
            Set Expiration
          </span>
          <button
            onClick={() => onExpirationToggle(!expirationEnabled)}
            className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${
              expirationEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${
                expirationEnabled
                  ? 'translate-x-5 md:translate-x-6'
                  : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Expiration Dropdown - shows when enabled */}
        {expirationEnabled && (
          <div className="mt-2 relative">
            <button
              onClick={() => onExpirationSelect(selectedExpiration)}
              className="w-full flex items-center justify-between border-2 border-gray-900 dark:border-white rounded-lg bg-white dark:bg-gray-800 px-3 md:px-4 py-2 md:py-3"
            >
              <span className="text-sm md:text-base font-medium text-gray-900 dark:text-white">
                {selectedExpiration}
              </span>
              <svg
                className="w-4 h-4 md:w-5 md:h-5 text-gray-900 dark:text-white transition-transform"
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

            {/* Dropdown Options */}
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
              <div className="py-1 md:py-2">
                {expirationOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => onExpirationSelect(option)}
                    className="w-full text-left px-3 md:px-4 py-2 md:py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span className="text-sm md:text-base font-medium text-gray-900 dark:text-white">
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Total and To Win - Responsive */}
      <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
            Total
          </span>
          <span className="text-lg md:text-lg font-bold text-blue-600">
            ${total.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
              To Win
            </span>
            <span className="text-sm md:text-base">💵</span>
          </div>
          <span className="text-lg md:text-lg font-bold text-green-600 dark:text-green-400">
            ${limitWin.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
