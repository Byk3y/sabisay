/**
 * Trading Sidebar Component
 * Extracted from page.tsx for better organization and reusability
 */

import { useState } from 'react';
import type { TradingSidebarProps } from '@/types/market';
import { 
  calculatePotentialWin, 
  calculateTotal, 
  calculateLimitWin,
  getTradeAmountFontSize,
  getWinAmountFontSize,
  getExpirationOptions,
  cleanTradeAmountInput,
  isTradeAmountWithinLimits
} from '@/lib/tradingUtils';

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
  const [isBuyDropdownOpen, setIsBuyDropdownOpen] = useState(false);
  const [isMobileInputFocused, setIsMobileInputFocused] = useState(false);
  const expirationOptions = getExpirationOptions();
  const currentOutcome = market.outcomes[selectedOutcome];
  const currentPrice = selectedCandidate === 0 ? currentOutcome?.price.yes : currentOutcome?.price.no;
  const potentialWin = tradeAmount ? calculatePotentialWin(parseFloat(tradeAmount), currentPrice || 0) : 0;

  return (
    <div className={`${
      isMobile 
        ? `fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
            isMobileSidebarOpen ? 'translate-y-0' : 'translate-y-full'
          } w-[430px] min-h-[418px]`
        : 'absolute top-0 right-0 w-[340px] h-[calc(100vh-200px)]'
    } ${isMobile ? '' : 'overflow-y-auto space-y-4'}`}>
      {/* Trading Interface */}
      <div className={`w-full bg-white dark:bg-gray-900 ${
        isMobile ? 'min-h-[418px] flex flex-col rounded-t-xl border-t border-l border-r border-gray-200 dark:border-gray-700' : 'rounded-xl border border-gray-200 dark:border-gray-700'
      } p-4`}>
        {/* Mobile Header with Dropdowns */}
        {isMobile && (
          <div className="flex items-center justify-between mb-6">
            {/* Buy/Sell Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsBuyDropdownOpen(!isBuyDropdownOpen)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                {tradeType === "buy" ? "Buy" : "Sell"}
                <svg className={`w-4 h-4 transition-transform ${isBuyDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Modal */}
              {isBuyDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      onTradeTypeChange("buy");
                      setIsBuyDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => {
                      onTradeTypeChange("sell");
                      setIsBuyDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 last:rounded-b-lg"
                  >
                    Sell
                  </button>
                </div>
              )}
            </div>
            
            {/* Market Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Market</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
          </div>
        )}
        {/* Main Content */}
        <div className={`${isMobile ? 'flex-1' : ''}`}>
          {/* Profile Section - Mobile only */}
          {isMobile && (
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {currentOutcome?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || "PO"}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {market.title}
                </h3>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm text-gray-600 dark:text-gray-400">
                    {currentOutcome?.name || "Peter Obi"}
                  </h4>
                  <button 
                    onClick={() => onCandidateSelect(selectedCandidate === 0 ? 1 : 0)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      selectedCandidate === 0 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <span>{selectedCandidate === 0 ? "Yes" : "No"}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Profile Section - Desktop only */}
          {!isMobile && (
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {currentOutcome?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || "PO"}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {currentOutcome?.name || "Peter Obi"}
                </h3>
              </div>
            </div>
          )}

        {/* Buy/Sell Tabs and Market Dropdown - Desktop only */}
        {!isMobile && (
          <div className="flex items-center justify-between mb-6">
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
        )}

        {/* Yes/No Selection - Desktop only */}
        {!isMobile && (
          <div className="mb-6">
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
        )}

        {orderType === "market" ? (
          /* Market Order - Amount Input */
          <div className="mb-3">
            {isMobile ? (
              /* Mobile Amount Input */
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
                      value={tradeAmount ? `$${parseFloat(tradeAmount).toLocaleString()}` : ''}
                      onChange={(e) => {
                        const rawValue = cleanTradeAmountInput(e.target.value);
                        if (isTradeAmountWithinLimits(rawValue)) {
                          onAmountChange(rawValue);
                        }
                      }}
                      onFocus={(e) => {
                        if (tradeAmount) {
                          e.target.value = tradeAmount;
                        }
                      }}
                      onBlur={(e) => {
                        if (tradeAmount) {
                          e.target.value = `$${parseFloat(tradeAmount).toLocaleString()}`;
                        }
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
            ) : (
              /* Desktop Amount Input - Original */
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
            )}
            
            {/* Desktop Quick Add Buttons - Original Position */}
            {!isMobile && (
              <div className="flex gap-1.5 justify-end my-3">
                <button
                  onClick={() => {
                    const currentAmount = parseFloat(tradeAmount) || 0;
                    const newAmount = currentAmount + 1;
                    if (isTradeAmountWithinLimits(newAmount.toString())) {
                      onAmountChange(newAmount.toString());
                    }
                  }}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  +$1
                </button>
                <button
                  onClick={() => {
                    const currentAmount = parseFloat(tradeAmount) || 0;
                    const newAmount = currentAmount + 20;
                    if (isTradeAmountWithinLimits(newAmount.toString())) {
                      onAmountChange(newAmount.toString());
                    }
                  }}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  +$20
                </button>
                <button
                  onClick={() => {
                    const currentAmount = parseFloat(tradeAmount) || 0;
                    const newAmount = currentAmount + 100;
                    if (isTradeAmountWithinLimits(newAmount.toString())) {
                      onAmountChange(newAmount.toString());
                    }
                  }}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  +$100
                </button>
                <button
                  onClick={() => onAmountChange("999999999")}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  Max
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Limit Order Interface */
          <div className="space-y-4">
            {/* Limit Price */}
            <div className="flex items-center justify-between">
              <label className="text-base font-semibold text-gray-900 dark:text-gray-100">Limit Price</label>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 w-40 h-10 overflow-hidden">
                <button
                  onClick={() => {
                    const currentValue = limitPrice || (selectedCandidate === 0 ? (currentOutcome?.probability || 45) : (currentOutcome?.probability || 38));
                    const current = parseFloat(currentValue.toString()) || 0;
                    onLimitPriceChange(Math.max(0.1, current - 0.1).toFixed(1));
                  }}
                  className="px-2 py-1 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 text-base font-semibold flex-shrink-0"
                >
                  —
                </button>
                <input
                  type="text"
                  value={limitPrice || (selectedCandidate === 0 ? (currentOutcome?.probability || 45) : (currentOutcome?.probability || 38))}
                  onChange={(e) => onLimitPriceChange(e.target.value)}
                  placeholder={selectedCandidate === 0 ? (currentOutcome?.probability?.toString() || "45") : (currentOutcome?.probability?.toString() || "38")}
                  className="flex-1 min-w-0 px-0 py-1 text-center bg-transparent border-none outline-none text-gray-900 dark:text-white font-bold text-lg"
                />
                <button
                  onClick={() => {
                    const currentValue = limitPrice || (selectedCandidate === 0 ? (currentOutcome?.probability || 45) : (currentOutcome?.probability || 38));
                    const current = parseFloat(currentValue.toString()) || 0;
                    onLimitPriceChange((current + 0.1).toFixed(1));
                  }}
                  className="px-2 py-1 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 text-base font-semibold flex-shrink-0"
                >
                  +
                </button>
              </div>
            </div>

            {/* Shares */}
            <div className="flex items-start justify-between">
              <label className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-2">Shares</label>
              <div className="flex flex-col items-end space-y-2">
                <input
                  type="text"
                  value={shares || ""}
                  onChange={(e) => onSharesChange(e.target.value)}
                  placeholder="0"
                  className="w-40 h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-center text-gray-900 dark:text-white font-semibold text-base outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const current = parseFloat(shares || "0") || 0;
                      onSharesChange(Math.max(0, current - 10).toString());
                    }}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    -10
                  </button>
                  <button
                    onClick={() => {
                      const current = parseFloat(shares || "0") || 0;
                      onSharesChange((current + 10).toString());
                    }}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    +10
                  </button>
                </div>
              </div>
            </div>

            {/* Set Expiration */}
            <div>
              <div className="flex items-center justify-between py-3">
                <span className="text-base font-semibold text-gray-900 dark:text-gray-100">Set Expiration</span>
                <button
                  onClick={() => onExpirationToggle(!expirationEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    expirationEnabled
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      expirationEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Expiration Dropdown - shows when enabled */}
              {expirationEnabled && (
                <div className="mt-2 relative">
                  <button
                    onClick={() => onExpirationSelect(selectedExpiration)}
                    className="w-full flex items-center justify-between border-2 border-gray-900 dark:border-white rounded-lg bg-white dark:bg-gray-800 px-4 py-3"
                  >
                    <span className="text-base font-medium text-gray-900 dark:text-white">{selectedExpiration}</span>
                    <svg className="w-5 h-5 text-gray-900 dark:text-white transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Options */}
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                    <div className="py-2">
                      {expirationOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => onExpirationSelect(option)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <span className="text-base font-medium text-gray-900 dark:text-white">{option}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Total and To Win */}
            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total</span>
                <span className="text-lg font-bold text-blue-600">
                  ${(() => {
                    const price = parseFloat(limitPrice || "0") || 0;
                    const shareCount = parseFloat(shares || "0") || 0;
                    const total = calculateTotal(price, shareCount);
                    return total.toFixed(2);
                  })()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">To Win</span>
                  <span>💵</span>
                </div>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  ${(() => {
                    const shareCount = parseFloat(shares || "0") || 0;
                    const limitPriceValue = parseFloat(limitPrice || "0") || 0;
                    const winAmount = calculateLimitWin(shareCount, limitPriceValue);
                    return winAmount.toFixed(2);
                  })()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* To Win Section - shows when amount is entered */}
        {tradeAmount && (
          <div className="mb-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-300">
            {isMobile ? (
              // Mobile layout - centered
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">To win</span>
                  <div className="w-4 h-4 text-green-500">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    ${potentialWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Avg. Price {currentPrice || 88}¢
                </div>
              </div>
            ) : (
              // Desktop layout - right aligned
              <div className="flex items-center justify-between">
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
                    ${potentialWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        </div>

        {/* Trade Button - Fixed at bottom on mobile */}
        <div className={`${isMobile ? 'mt-4' : ''}`}>
          
          {/* Mobile Quick Add Buttons - Directly above Trade Button */}
          {isMobile && (
            <div className="flex gap-2 justify-center mb-2">
              <button
                onClick={() => {
                  const currentAmount = parseFloat(tradeAmount) || 0;
                  const newAmount = currentAmount + 1;
                  if (isTradeAmountWithinLimits(newAmount.toString())) {
                    onAmountChange(newAmount.toString());
                  }
                }}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                +$1
              </button>
              <button
                onClick={() => {
                  const currentAmount = parseFloat(tradeAmount) || 0;
                  const newAmount = currentAmount + 20;
                  if (isTradeAmountWithinLimits(newAmount.toString())) {
                    onAmountChange(newAmount.toString());
                  }
                }}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                +$20
              </button>
              <button
                onClick={() => {
                  const currentAmount = parseFloat(tradeAmount) || 0;
                  const newAmount = currentAmount + 100;
                  if (isTradeAmountWithinLimits(newAmount.toString())) {
                    onAmountChange(newAmount.toString());
                  }
                }}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                +$100
              </button>
              <button
                onClick={() => onAmountChange("999999999")}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Max
              </button>
            </div>
          )}
          
          <button 
            onClick={() => onTrade({
              amount: tradeAmount,
              type: selectedCandidate === 0 ? "buy" : "sell",
              candidate: selectedCandidate,
              outcome: selectedOutcome,
              orderType,
              limitPrice: limitPrice,
              shares: shares,
              expiration: selectedExpiration
            })}
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
      </div>
    </div>
  );
};
