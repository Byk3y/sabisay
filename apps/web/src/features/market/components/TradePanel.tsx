import React, { useState } from 'react';
import { formatCurrency, formatCents, toWinDollars } from '@/lib/tradeFormat';

export interface TradePanelProps {
  selectedOutcome: {
    name: string;
    price: {
      yes: number;
      no: number;
    };
  } | undefined;
  onTrade: (amount: number, isYes: boolean) => void;
}

export function TradePanel({ selectedOutcome, onTrade }: TradePanelProps) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [tradeAmount, setTradeAmount] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(0);

  if (!selectedOutcome) {
    return (
      <div className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Select an outcome to trade
        </div>
      </div>
    );
  }

  const handleTrade = () => {
    const amount = parseFloat(tradeAmount);
    if (amount > 0) {
      onTrade(amount, selectedCandidate === 0);
    }
  };

  const quickAddAmount = (addAmount: number) => {
    const currentAmount = parseFloat(tradeAmount) || 0;
    const newAmount = currentAmount + addAmount;
    if (newAmount.toString().replace(/\./g, '').length <= 9) {
      setTradeAmount(newAmount.toString());
    }
  };

  const currentPrice = selectedCandidate === 0 ? selectedOutcome.price.yes : selectedOutcome.price.no;
  const potentialWin = toWinDollars(parseFloat(tradeAmount) || 0, currentPrice);

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      {/* Profile Section */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-lg font-bold text-white">
            {selectedOutcome.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {selectedOutcome.name}
          </h3>
        </div>
      </div>

      {/* Buy/Sell Tabs and Market Dropdown */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setTradeType('buy')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors text-sm ${
              tradeType === 'buy'
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm border-b-2 border-gray-900 dark:border-white"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setTradeType('sell')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors text-sm ${
              tradeType === 'sell'
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm border-b-2 border-gray-900 dark:border-white"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            Sell
          </button>
        </div>
        <button
          onClick={() => setOrderType(orderType === 'market' ? 'limit' : 'market')}
          className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors"
        >
          <span className="font-semibold">{orderType === 'market' ? 'Market' : 'Limit'}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Yes/No Selection */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedCandidate(0)}
            className={`px-3 py-2 border rounded-lg text-center transition-colors h-11 ${
              selectedCandidate === 0
                ? "bg-green-600 border-green-600 hover:bg-green-700 text-white"
                : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
            }`}
          >
            <span className="text-base font-semibold mr-2">Yes</span>
            <span className="text-lg font-bold">{formatCents(selectedOutcome.price.yes)}</span>
          </button>
          <button
            onClick={() => setSelectedCandidate(1)}
            className={`px-3 py-2 border rounded-lg text-center transition-colors h-11 ${
              selectedCandidate === 1
                ? "bg-red-600 border-red-600 hover:bg-red-700 text-white"
                : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
            }`}
          >
            <span className="text-base font-semibold mr-2">No</span>
            <span className="text-lg font-bold">{formatCents(selectedOutcome.price.no)}</span>
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-3">
        <div className="mb-1">
          <div className="relative text-right overflow-hidden whitespace-nowrap h-16 flex items-center justify-between">
            <label className="text-base font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">Amount</label>
            <div className="flex items-center justify-end relative min-w-0" style={{ flex: '1 1 0%' }}>
              <input
                type="text"
                value={tradeAmount ? `$${parseFloat(tradeAmount).toLocaleString()}` : ''}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/[$,]/g, '');
                  const cleanValue = rawValue.replace(/[^0-9.]/g, '').replace(/(\..*?)\./g, '$1');
                  const numbers = cleanValue.replace(/\./g, '');
                  if (numbers.length <= 9) {
                    setTradeAmount(cleanValue);
                  }
                }}
                placeholder="$0"
                className="w-full bg-transparent border-none outline-none font-bold text-right text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                style={{
                  fontSize: tradeAmount && tradeAmount.length <= 3 ? '3rem' :
                           tradeAmount && tradeAmount.length <= 5 ? '2.5rem' :
                           tradeAmount && tradeAmount.length <= 7 ? '2rem' :
                           tradeAmount && tradeAmount.length <= 9 ? '1.75rem' :
                           tradeAmount ? '1.5rem' : '3rem'
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-1.5 justify-end my-3">
          {[1, 20, 100].map((amount) => (
            <button
              key={amount}
              onClick={() => quickAddAmount(amount)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
            >
              +${amount}
            </button>
          ))}
          <button
            onClick={() => setTradeAmount("999999999")}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
          >
            Max
          </button>
        </div>
      </div>

      {/* To Win Section */}
      {tradeAmount && (
        <div className="mb-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 text-base font-semibold mb-1">
                <span>To win</span>
                <span>💰</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 font-medium">
                <span>Avg. Price {formatCents(currentPrice)}</span>
                <div className="w-3 h-3 rounded-full border border-gray-400 flex items-center justify-center">
                  <span className="text-[8px]">?</span>
                </div>
              </div>
            </div>
            <div className="text-right min-w-[140px] flex justify-end">
              <div
                className="font-bold text-green-600 dark:text-green-400 h-12 flex items-center justify-end"
                style={{
                  fontSize: (() => {
                    const winString = potentialWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    const length = winString.length;
                    return length <= 6 ? '2.75rem' :
                           length <= 8 ? '2.25rem' :
                           length <= 10 ? '1.875rem' :
                           length <= 12 ? '1.625rem' : '1.375rem';
                  })()
                }}
              >
                {formatCurrency(potentialWin)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trade Button */}
      <button 
        onClick={handleTrade}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 px-4 rounded-lg transition-colors text-sm"
      >
        Trade
      </button>

      {/* TODO: Add quotes/slippage/approve functionality */}
      {/* TODO: Implement actual trading logic with contract calls */}
      {/* TODO: Add slippage protection */}
      {/* TODO: Add approval flow for ERC20 tokens */}
    </div>
  );
}
