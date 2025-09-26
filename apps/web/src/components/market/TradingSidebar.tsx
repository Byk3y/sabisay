/**
 * Trading Sidebar Component
 * Refactored to use responsive design patterns and extracted components
 */

import { useState, useRef } from 'react';
import type { TradingSidebarProps } from '@/types/market';
import { calculatePotentialWin } from '@/lib/tradingUtils';
import { ProfileSection } from './trading/ProfileSection';
import { AmountInput } from './trading/AmountInput';
import { ToWinSection } from './trading/ToWinSection';
import { TradeButton } from './trading/TradeButton';
import { BuySellDropdown } from './trading/BuySellDropdown';
import { MarketDropdown } from './trading/MarketDropdown';
import { LimitOrderInterface } from './trading/LimitOrderInterface';
import { SellSection } from './trading/SellSection';
import { QuickAddButtons } from './trading/QuickAddButtons';

/**
 * Trading sidebar component with buy/sell interface
 * @param props - Component props
 * @returns JSX element
 */
export const TradingSidebar = ({
  market,
  selectedOutcome,
  selectedCandidate,
  tradeAmount,
  tradeType,
  orderType,
  limitPrice,
  shares,
  expirationEnabled,
  selectedExpiration,
  isMobile = false,
  isMobileSidebarOpen = false,
  isChanceMarket = false,
  onTrade,
  onOutcomeSelect,
  onCandidateSelect,
  onAmountChange,
  onOrderTypeChange,
  onTradeTypeChange,
  onLimitPriceChange,
  onSharesChange,
  onExpirationToggle,
  onExpirationSelect,
  onMobileSidebarClose
}: TradingSidebarProps) => {
  const currentOutcome = market.outcomes[selectedOutcome];
  const currentPrice = selectedCandidate === 0 ? currentOutcome?.price.yes : currentOutcome?.price.no;
  const potentialWin = tradeAmount ? calculatePotentialWin(parseFloat(tradeAmount), currentPrice || 0) : 0;

  // Touch event handlers for swipe-down gesture
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !e.touches[0]) return;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || !onMobileSidebarClose || !e.changedTouches[0]) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();
    const deltaY = touchEndY - touchStartY.current;
    const deltaTime = touchEndTime - touchStartTime.current;
    
    // Check if it's a swipe down gesture
    // Minimum swipe distance: 50px down
    // Maximum time: 300ms
    // Must start from near the top of the card (within 100px from top)
    const isSwipeDown = deltaY > 50 && deltaTime < 300;
    const isNearTop = touchStartY.current < 100;
    
    if (isSwipeDown && isNearTop) {
      onMobileSidebarClose();
    }
  };

  return (
    <div 
      className={`
        fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out
        md:absolute md:top-0 md:right-0 md:left-auto md:transform-none
        ${isMobileSidebarOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
        w-[430px] ${isChanceMarket ? (isMobile ? (orderType === "limit" ? 'min-h-[500px]' : 'min-h-[418px]') : 'h-auto') : (orderType === "limit" ? 'min-h-[500px]' : 'min-h-[418px]')} md:w-[340px] md:h-[calc(100vh-200px)]
        md:overflow-y-auto md:space-y-4
      `}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Trading Interface */}
      <div className={`w-full bg-white dark:bg-gray-900 ${isChanceMarket ? (isMobile ? (orderType === "limit" ? 'min-h-[500px]' : 'min-h-[418px]') : 'h-auto') : (orderType === "limit" ? 'min-h-[500px]' : 'min-h-[418px]')} flex flex-col rounded-t-xl border-t border-l border-r border-gray-200 dark:border-gray-700 md:min-h-auto md:rounded-xl md:border md:border-gray-200 dark:md:border-gray-700 p-4 transition-all duration-300 ease-in-out`}>
        {/* Mobile Handle - Swipe Down Indicator */}
        <div className="block md:hidden flex justify-center pt-3 pb-0">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        
        {/* Mobile Header with Dropdowns */}
        <div className="block md:hidden flex items-center justify-between mb-4 -mt-2">
          <BuySellDropdown 
            tradeType={tradeType}
            onTradeTypeChange={onTradeTypeChange}
          />
          
          {/* Market Dropdown */}
          <MarketDropdown 
            orderType={orderType}
            onOrderTypeChange={onOrderTypeChange}
          />
        </div>
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Profile Section - Show for all markets on mobile, hide for chance markets on desktop */}
          {currentOutcome && (!isChanceMarket || isMobile) && (
            <ProfileSection
              market={market}
              currentOutcome={currentOutcome}
              selectedCandidate={selectedCandidate}
              onCandidateSelect={onCandidateSelect}
            />
          )}

          {/* Buy/Sell Tabs and Market Dropdown - Desktop only */}
          <div className={`hidden md:flex items-center justify-between ${!isChanceMarket ? 'mb-6' : 'mb-4'}`}>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => onTradeTypeChange("buy")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors text-sm ${
                tradeType === "buy"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm border-b-2 border-gray-900 dark:border-white"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => onTradeTypeChange("sell")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors text-sm ${
                tradeType === "sell"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm border-b-2 border-gray-900 dark:border-white"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Sell
            </button>
          </div>
          <button
            onClick={() => onOrderTypeChange(orderType === "market" ? "limit" : "market")}
            className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors"
          >
            <span className="font-semibold">{orderType === "market" ? "Market" : "Limit"}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Yes/No Selection - Desktop only */}
        <div className="hidden md:block mb-6">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onCandidateSelect(0)}
              className={`px-3 py-2 border rounded-lg text-center transition-colors ${
                selectedCandidate === 0
                  ? "bg-green-500 border-green-500 hover:bg-green-600"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span className={`text-base font-semibold ${
                selectedCandidate === 0 ? "text-white" : "text-gray-900 dark:text-white"
              } mr-2`}>Yes</span>
              <span className={`text-lg font-bold ${
                selectedCandidate === 0 ? "text-white" : "text-gray-900 dark:text-white"
              }`}>{currentOutcome?.price?.yes || 88}¢</span>
            </button>
            <button
              onClick={() => onCandidateSelect(1)}
              className={`px-3 py-2 border rounded-lg text-center transition-colors ${
                selectedCandidate === 1
                  ? "bg-red-500 border-red-500 hover:bg-red-600"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span className={`text-base font-semibold ${
                selectedCandidate === 1 ? "text-white" : "text-gray-900 dark:text-white"
              } mr-2`}>No</span>
              <span className={`text-lg font-bold ${
                selectedCandidate === 1 ? "text-white" : "text-gray-900 dark:text-white"
              }`}>{currentOutcome?.price?.no || 12.2}¢</span>
            </button>
          </div>
        </div>

          {/* Centered Amount Input Section */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-6">
              {orderType === "market" ? (
                /* Market Order - Conditional rendering based on trade type */
                tradeType === "buy" ? (
                  <AmountInput
                    tradeAmount={tradeAmount}
                    onAmountChange={onAmountChange}
                  />
                ) : (
                  /* Sell Section - Both Mobile and Desktop */
                  <div>
                    {currentOutcome && (
                      <SellSection
                        selectedCandidate={selectedCandidate}
                        currentOutcome={currentOutcome}
                        shares={shares}
                        onSharesChange={onSharesChange}
                      />
                    )}
                  </div>
                )
              ) : (
                /* Limit Order Interface - Both Mobile and Desktop */
                <div>
                  {currentOutcome && (
                    <LimitOrderInterface
                      selectedCandidate={selectedCandidate}
                      currentOutcome={currentOutcome}
                      limitPrice={limitPrice}
                      shares={shares}
                      expirationEnabled={expirationEnabled}
                      selectedExpiration={selectedExpiration}
                      onLimitPriceChange={onLimitPriceChange}
                      onSharesChange={onSharesChange}
                      onExpirationToggle={onExpirationToggle}
                      onExpirationSelect={onExpirationSelect}
                    />
                  )}
                </div>
              )}

              {/* To Win Section - shows when amount is entered for buy orders only */}
              {tradeAmount && tradeType === "buy" && (
                <ToWinSection
                  potentialWin={potentialWin}
                  currentPrice={currentPrice || 88}
                />
              )}
            </div>

          </div>

          {/* Trade Button and Terms - Bottom of card */}
          <div className="mt-auto">
            {/* Mobile Quick Add Buttons - Only for Market orders */}
            {orderType === "market" && (
              <div className="block md:hidden mb-2">
                <QuickAddButtons
                  tradeAmount={tradeAmount}
                  onAmountChange={onAmountChange}
                  tradeType={tradeType}
                  shares={shares}
                  onSharesChange={onSharesChange}
                />
              </div>
            )}
            <TradeButton
              tradeData={{
                amount: tradeAmount,
                type: selectedCandidate === 0 ? "buy" : "sell",
                candidate: selectedCandidate,
                outcome: selectedOutcome,
                orderType,
                limitPrice: limitPrice,
                shares: shares,
                expiration: selectedExpiration
              }}
              tradeType={tradeType}
              onTrade={onTrade}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
