/**
 * Trade Button Component
 * Extracted from TradingSidebar for better organization
 */

import type { TradeData } from '@/types/market';

interface TradeButtonProps {
  tradeAmount: string;
  selectedCandidate: number;
  selectedOutcome: number;
  orderType: string;
  limitPrice: string;
  shares: string;
  selectedExpiration: string;
  isMobile: boolean;
  onTrade: (tradeData: TradeData) => void;
}

/**
 * Trade button component with mobile and desktop layouts
 * @param props - Component props
 * @returns JSX element
 */
export const TradeButton = ({
  tradeAmount,
  selectedCandidate,
  selectedOutcome,
  orderType,
  limitPrice,
  shares,
  selectedExpiration,
  isMobile,
  onTrade
}: TradeButtonProps) => {
  const handleTrade = () => {
    onTrade({
      amount: tradeAmount,
      type: selectedCandidate === 0 ? "buy" : "sell",
      candidate: selectedCandidate,
      outcome: selectedOutcome,
      orderType,
      limitPrice: limitPrice,
      shares: shares,
      expiration: selectedExpiration
    });
  };

  return (
    <div className={`${isMobile ? 'mt-4' : ''}`}>
      <button 
        onClick={handleTrade}
        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 rounded-lg transition-colors text-sm mt-4 ${
          isMobile ? 'py-3.5' : 'py-2.5'
        }`}
      >
        Trade
      </button>
      
      {/* Terms of Use - Mobile only */}
      {isMobile && (
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 text-center mt-2">
          By trading, you agree to the{' '}
          <span className="underline cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
            Terms of Use
          </span>
          .
        </p>
      )}
    </div>
  );
};
