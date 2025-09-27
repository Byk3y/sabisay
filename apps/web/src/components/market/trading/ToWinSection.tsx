/**
 * To Win Section Component
 * Responsive component for potential win display
 * Mobile: Centered layout with SVG icon
 * Desktop: Right-aligned layout with emoji icon
 */

import { getWinAmountFontSize } from '@/lib/tradingUtils';

interface ToWinSectionProps {
  potentialWin: number;
  currentPrice: number;
}

/**
 * To win section component with responsive design
 * @param props - Component props
 * @returns JSX element
 */
export const ToWinSection = ({
  potentialWin,
  currentPrice,
}: ToWinSectionProps) => {
  const formattedWinAmount = potentialWin.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="mb-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-300">
      {/* Mobile layout - centered */}
      <div className="block md:hidden text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="text-base font-semibold text-gray-600 dark:text-gray-400">
            To win
          </span>
          <div className="w-4 h-4 text-green-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-green-600 dark:text-green-400">
            ${formattedWinAmount}
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Avg. Price {currentPrice || 88}¢
        </div>
      </div>

      {/* Desktop layout - right aligned */}
      <div className="hidden md:flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 text-base font-semibold mb-1">
            <span>To win</span>
            <span>💰</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 font-medium">
            <span>Avg. Price {currentPrice || 88}¢</span>
            <div className="w-3 h-3 rounded-full border border-gray-400 flex items-center justify-center">
              <span className="text-[8px]">?</span>
            </div>
          </div>
        </div>
        <div className="text-right min-w-[140px] flex justify-end">
          <div
            className="font-bold text-green-600 dark:text-green-400 h-12 flex items-center justify-end"
            style={{ fontSize: getWinAmountFontSize(potentialWin) }}
          >
            ${formattedWinAmount}
          </div>
        </div>
      </div>
    </div>
  );
};
