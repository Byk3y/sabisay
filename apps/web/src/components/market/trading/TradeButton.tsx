/**
 * Trade Button Component
 * Responsive trade button with different styles for mobile/desktop
 * Mobile: Larger button with terms text below
 * Desktop: Standard button
 */

import type { TradeData } from '@/types/market';

interface TradeButtonProps {
  tradeData: TradeData;
  tradeType: 'buy' | 'sell';
  onTrade: (tradeData: TradeData) => void;
}

/**
 * Trade button component with responsive design
 * @param props - Component props
 * @returns JSX element
 */
export const TradeButton = ({
  tradeData,
  tradeType,
  onTrade,
}: TradeButtonProps) => {
  const handleTrade = () => {
    onTrade(tradeData);
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleTrade}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 rounded-lg transition-colors text-sm py-3.5 md:py-2.5"
      >
        {tradeType === 'buy' ? 'Trade' : 'Sell'}
      </button>

      {/* Terms of Use - Mobile only */}
      <p className="block md:hidden text-sm font-bold text-gray-500 dark:text-gray-400 text-center mt-2">
        By trading, you agree to the{' '}
        <span className="underline cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
          Terms of Use
        </span>
        .
      </p>
    </div>
  );
};
