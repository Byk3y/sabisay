"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { mockMarkets, type Category } from "@/lib/mock";
import { TopNavClient } from "@/components/nav/TopNavClient";
import { CategoryTabs } from "@/components/nav/CategoryTabs";

// Helper function to get market by ID
function getMarketById(id: string) {
  const market = mockMarkets.find(m => m.id === id);
  if (!market) return null;
  
  return {
    id: market.id,
    title: market.question,
    volume: market.poolUsd,
    endDate: new Date(market.closesAt || new Date()),
    outcomes: market.outcomes.map(outcome => ({
      name: outcome.label,
      probability: outcome.oddsPct,
      volume: Math.round(market.poolUsd * (outcome.oddsPct / 100)),
      price: {
        yes: Math.round(outcome.oddsPct),
        no: Math.round(100 - outcome.oddsPct)
      }
    })),
    relatedMarkets: [
      {
        id: "1",
        title: "Will the Democratic candidate win the 2025 NYC mayoral election?",
        probability: 90,
        volume: 15000000
      },
      {
        id: "2", 
        title: "Will Andrew Cuomo win second place in the 2025 NYC mayoral election?",
        probability: 85,
        volume: 8000000
      }
    ]
  };
}

export default function MarketDetailsPage() {
  const params = useParams();
  const { mounted } = useTheme();
  const marketId = params.id as string;
  const [market, setMarket] = useState(getMarketById(marketId));
  const [tradeAmount, setTradeAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [activeCategory, setActiveCategory] = useState<Category>("Trending");
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    console.log('Market:', market?.title || 'Not found', 'Tab:', activeTab);
  }, [market, activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b1220] text-gray-900 dark:text-white transition-colors">
        <TopNavClient />
        <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b1220] text-gray-900 dark:text-white transition-colors">
        <TopNavClient />
        <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Market Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400">The market you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1220] text-gray-900 dark:text-white transition-colors">
      {/* Top Navigation */}
      <TopNavClient />

      {/* Category Tabs */}
      <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-6">
        <div className="relative">
          {/* Left Column - Market Details */}
          <div className="max-w-4xl space-y-6">
            {/* Market Header */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-2xl flex items-center justify-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">🗽</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {market.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${market.volume.toLocaleString()} Vol.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {market.endDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Trading Sidebar */}
          <div className="absolute top-0 right-0 w-[340px] space-y-4">
            {/* Trading Interface */}
            <div className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              {/* Profile Section */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-white">ZM</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Zohran Mamdani</h3>
                </div>
              </div>

              {/* Buy/Sell Tabs and Market Dropdown */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button className="px-3 py-1.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md font-medium transition-colors shadow-sm border-b-2 border-gray-900 dark:border-white text-sm">Buy</button>
                  <button className="px-3 py-1.5 text-gray-600 dark:text-gray-400 font-medium transition-colors text-sm">Sell</button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Market</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Outcome Selection */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Yes </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">88¢</span>
                  </button>
                  <button className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    <span className="text-sm font-semibold text-red-700 dark:text-red-400">No </span>
                    <span className="text-lg font-bold text-red-700 dark:text-red-400">12.2¢</span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-3">
                <div className="mb-1">
                  <div className="relative text-right overflow-hidden whitespace-nowrap h-16 flex items-center justify-between">
                    <label className="text-base font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">Amount</label>
                    <div className="flex items-center justify-end relative min-w-0" style={{ flex: '1 1 0%' }}>
                      {/* Display formatted value when not focused */}
                      {tradeAmount && !isInputFocused && (
                        <div
                          className="text-gray-900 dark:text-white font-bold whitespace-nowrap pointer-events-none"
                          style={{
                            fontSize: tradeAmount.length <= 3 ? '3rem' :
                                     tradeAmount.length <= 5 ? '2.5rem' :
                                     tradeAmount.length <= 7 ? '2rem' :
                                     tradeAmount.length <= 9 ? '1.75rem' : '1.5rem'
                          }}
                        >
                          ${parseFloat(tradeAmount).toLocaleString()}
                        </div>
                      )}

                      {/* Display dollar sign and raw value when focused */}
                      {tradeAmount && isInputFocused && (
                        <div className="flex items-center justify-end">
                          <span className="text-gray-900 dark:text-white font-bold" style={{
                            fontSize: tradeAmount.length <= 3 ? '3rem' :
                                     tradeAmount.length <= 5 ? '2.5rem' :
                                     tradeAmount.length <= 7 ? '2rem' :
                                     tradeAmount.length <= 9 ? '1.75rem' : '1.5rem'
                          }}>$</span>
                          <span className="text-gray-900 dark:text-white font-bold" style={{
                            fontSize: tradeAmount.length <= 3 ? '3rem' :
                                     tradeAmount.length <= 5 ? '2.5rem' :
                                     tradeAmount.length <= 7 ? '2rem' :
                                     tradeAmount.length <= 9 ? '1.75rem' : '1.5rem'
                          }}>
                            {parseFloat(tradeAmount).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Input field for editing */}
                      <input
                        type="text"
                        value={tradeAmount || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\./g, '$1');
                          const numbers = value.replace(/\./g, '');
                          if (numbers.length <= 9) {
                            setTradeAmount(value);
                          }
                        }}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        placeholder="$0"
                        className={`bg-transparent border-none outline-none font-bold text-right text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                          isInputFocused && tradeAmount ? 'absolute inset-0 text-transparent caret-gray-900 dark:caret-white' : 'w-full'
                        }`}
                        style={{
                          fontSize: tradeAmount && tradeAmount.length <= 3 ? '3rem' :
                                   tradeAmount && tradeAmount.length <= 5 ? '2.5rem' :
                                   tradeAmount && tradeAmount.length <= 7 ? '2rem' :
                                   tradeAmount && tradeAmount.length <= 9 ? '1.75rem' :
                                   tradeAmount ? '1.5rem' : '3rem',
                          caretColor: isInputFocused && tradeAmount ? 'black' : 'auto'
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 justify-end my-3">
                  <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
                    +$1
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
                    +$20
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
                    +$100
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
                    Max
                  </button>
                </div>
              </div>

              {/* Trade Button */}
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm mt-4">
                Trade
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Content Below */}
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-6">
          <div className="max-w-4xl">
            {/* Left Column - Market Details */}
            <div className="space-y-6">
              {/* Outcome Table */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      OUTCOME
                    </h2>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      % CHANGE
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {market.outcomes.map((outcome, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {outcome.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white text-lg">
                              {outcome.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              ${outcome.volume.toLocaleString()} Vol.
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {outcome.probability}%
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button className="px-4 py-2 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                              Buy Yes {outcome.price.yes}¢
                            </button>
                            <button className="px-4 py-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                              Buy No {outcome.price.no}¢
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Probability Over Time
                </h2>
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400">
                    Chart will be implemented here
                  </span>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}