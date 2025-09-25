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
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [selectedCandidate, setSelectedCandidate] = useState(0); // Index of the candidate being traded
  const [selectedOutcome, setSelectedOutcome] = useState(0); // Index of the outcome being traded
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [shares, setShares] = useState("");
  const [expirationEnabled, setExpirationEnabled] = useState(false);
  const [expirationDropdownOpen, setExpirationDropdownOpen] = useState(false);
  const [selectedExpiration, setSelectedExpiration] = useState("End of day");

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
      <div className="max-w-7xl mx-auto px-0 py-6">
        <div className="relative">
          {/* Left Column - Market Details */}
          <div className="max-w-4xl space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-4">
            {/* Market Header - Match Polymarket layout */}
            <div className="mb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-2xl font-bold">📊</span>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {market.title}
                  </h1>
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

              {/* Volume and Date under the icon */}
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>${market.volume.toLocaleString()} Vol.</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    {market.endDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="mb-6">
              {/* Chart Legend */}
              <div className="flex items-center gap-6 mb-2 text-sm">
                {market?.outcomes?.map((outcome, index) => {
                  const colors = ['bg-orange-500', 'bg-blue-500', 'bg-yellow-500', 'bg-gray-500'];
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`w-3 h-3 ${colors[index]} rounded-full`}></div>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {outcome.name} {outcome.probability}%
                      </span>
                    </div>
                  );
                }) || (
                  // Fallback legend if market data is not available
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-900 dark:text-white font-medium">Loading...</span>
                    </div>
                  </>
                )}
              </div>

              {/* Chart Area */}
              <div className="relative h-60 flex items-center justify-center overflow-hidden">
                {/* Chart placeholder with grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  {/* Chart content area */}
                  <div className="flex justify-between items-center h-full">
                    {/* Chart content area */}
                    <div className="flex-1 h-full relative">
                      {/* Dotted grid lines extending almost to the right border */}
                      <div className="absolute -left-4 right-8 top-0 bottom-0 flex flex-col justify-between">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="border-t border-dotted border-gray-300 dark:border-gray-600 w-full"></div>
                        ))}
                      </div>

                      {/* Mock chart lines - solid lines */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 749 240">
                        {/* 50+ bps decrease line (orange) - trending upward */}
                        <path
                          d="M10,225 L80,215 L150,200 L220,185 L290,165 L360,145 L430,125 L500,105 L570,95 L640,88 L710,82 L749,80"
                          stroke="#f97316"
                          strokeWidth="2"
                          fill="none"
                        />
                        {/* 25 bps decrease line (blue) - stable to declining */}
                        <path
                          d="M10,205 L80,200 L150,195 L220,190 L290,185 L360,180 L430,175 L500,170 L570,165 L640,162 L710,160 L749,158"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>

                      {/* Y-axis percentage labels positioned at the absolute right edge */}
                      <div className="absolute right-0 top-0 h-full w-8">
                        <div className="absolute top-0 right-0 flex items-center h-0">
                          <span className="text-xs text-gray-500 dark:text-gray-400">80%</span>
                        </div>
                        <div className="absolute top-1/4 right-0 flex items-center h-0">
                          <span className="text-xs text-gray-500 dark:text-gray-400">60%</span>
                        </div>
                        <div className="absolute top-1/2 right-0 flex items-center h-0">
                          <span className="text-xs text-gray-500 dark:text-gray-400">40%</span>
                        </div>
                        <div className="absolute top-3/4 right-0 flex items-center h-0">
                          <span className="text-xs text-gray-500 dark:text-gray-400">20%</span>
                        </div>
                        <div className="absolute bottom-0 right-0 flex items-center h-0">
                          <span className="text-xs text-gray-500 dark:text-gray-400">0%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div className="relative text-xs text-gray-500 dark:text-gray-400 mt-2 h-4">
                    <span className="absolute left-0">May</span>
                    <span className="absolute left-[20%]">Jun</span>
                    <span className="absolute left-[40%]">Jul</span>
                    <span className="absolute left-[60%]">Aug</span>
                    <span className="absolute left-[80%]">Sep</span>
                  </div>
                </div>
              </div>

              {/* Time period buttons */}
              <div className="flex items-center gap-2 mt-4">
                <button className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">1H</button>
                <button className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">6H</button>
                <button className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">1D</button>
                <button className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">1W</button>
                <button className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">1M</button>
                <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded">ALL</button>
              </div>
            </div>
          </div>

          {/* Right Column - Trading Sidebar */}
          <div className="absolute top-0 right-0 w-[340px] h-[calc(100vh-200px)] overflow-y-auto space-y-4">
            {/* Trading Interface */}
            <div className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              {/* Profile Section */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {market.outcomes[selectedOutcome]?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || "PO"}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {market.outcomes[selectedOutcome]?.name || "Peter Obi"}
                  </h3>
                </div>
              </div>

              {/* Buy/Sell Tabs and Market Dropdown */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setTradeType("buy")}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors text-sm ${
                      tradeType === "buy"
                        ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm border-b-2 border-gray-900 dark:border-white"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setTradeType("sell")}
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
                  onClick={() => setOrderType(orderType === "market" ? "limit" : "market")}
                  className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors"
                >
                  <span className="font-semibold">{orderType === "market" ? "Market" : "Limit"}</span>
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
                    }`}>{market.outcomes[selectedOutcome]?.price?.yes || 88}¢</span>
                  </button>
                  <button
                    onClick={() => setSelectedCandidate(1)}
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
                    }`}>{market.outcomes[selectedOutcome]?.price?.no || 12.2}¢</span>
                  </button>
                </div>
              </div>

              {orderType === "market" ? (
                /* Market Order - Amount Input */
                <div className="mb-3">
                <div className="mb-1">
                  <div className="relative text-right overflow-hidden whitespace-nowrap h-16 flex items-center justify-between">
                    <label className="text-base font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">Amount</label>
                    <div className="flex items-center justify-end relative min-w-0" style={{ flex: '1 1 0%' }}>
                      {/* Single input field with proper formatting */}
                      <input
                        type="text"
                        value={tradeAmount ? `$${parseFloat(tradeAmount).toLocaleString()}` : ''}
                        onChange={(e) => {
                          // Extract raw number from formatted input
                          const rawValue = e.target.value.replace(/[$,]/g, '');
                          const cleanValue = rawValue.replace(/[^0-9.]/g, '').replace(/(\..*?)\./g, '$1');
                          const numbers = cleanValue.replace(/\./g, '');
                          if (numbers.length <= 9) {
                            setTradeAmount(cleanValue);
                          }
                        }}
                        onFocus={() => {
                          setIsInputFocused(true);
                          // Show raw value for editing
                          const input = document.activeElement as HTMLInputElement;
                          if (input && tradeAmount) {
                            input.value = tradeAmount;
                          }
                        }}
                        onBlur={() => {
                          setIsInputFocused(false);
                          // Show formatted value
                          const input = document.activeElement as HTMLInputElement;
                          if (input && tradeAmount) {
                            input.value = `$${parseFloat(tradeAmount).toLocaleString()}`;
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
                  <button
                    onClick={() => {
                      const currentAmount = parseFloat(tradeAmount) || 0;
                      const newAmount = currentAmount + 1;
                      if (newAmount.toString().replace(/\./g, '').length <= 9) {
                        setTradeAmount(newAmount.toString());
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
                      if (newAmount.toString().replace(/\./g, '').length <= 9) {
                        setTradeAmount(newAmount.toString());
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
                      if (newAmount.toString().replace(/\./g, '').length <= 9) {
                        setTradeAmount(newAmount.toString());
                      }
                    }}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    +$100
                  </button>
                  <button
                    onClick={() => {
                      setTradeAmount("999999999");
                    }}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    Max
                  </button>
                </div>
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
                          const currentValue = limitPrice || (selectedCandidate === 0 ? (market.outcomes[0]?.probability || 45) : (market.outcomes[1]?.probability || 38));
                          const current = parseFloat(currentValue.toString()) || 0;
                          setLimitPrice(Math.max(0.1, current - 0.1).toFixed(1));
                        }}
                        className="px-2 py-1 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 text-base font-semibold flex-shrink-0"
                      >
                        —
                      </button>
                      <input
                        type="text"
                        value={limitPrice || (selectedCandidate === 0 ? (market.outcomes[0]?.probability || 45) : (market.outcomes[1]?.probability || 38))}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        placeholder={selectedCandidate === 0 ? (market.outcomes[0]?.probability?.toString() || "45") : (market.outcomes[1]?.probability?.toString() || "38")}
                        className="flex-1 min-w-0 px-0 py-1 text-center bg-transparent border-none outline-none text-gray-900 dark:text-white font-bold text-lg"
                      />
                      <button
                        onClick={() => {
                          const currentValue = limitPrice || (selectedCandidate === 0 ? (market.outcomes[0]?.probability || 45) : (market.outcomes[1]?.probability || 38));
                          const current = parseFloat(currentValue.toString()) || 0;
                          setLimitPrice((current + 0.1).toFixed(1));
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
                        value={shares}
                        onChange={(e) => setShares(e.target.value)}
                        placeholder="0"
                        className="w-40 h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-center text-gray-900 dark:text-white font-semibold text-base outline-none focus:border-blue-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const current = parseFloat(shares) || 0;
                            setShares(Math.max(0, current - 10).toString());
                          }}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => {
                            const current = parseFloat(shares) || 0;
                            setShares((current + 10).toString());
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
                        onClick={() => setExpirationEnabled(!expirationEnabled)}
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
                          onClick={() => setExpirationDropdownOpen(!expirationDropdownOpen)}
                          className="w-full flex items-center justify-between border-2 border-gray-900 dark:border-white rounded-lg bg-white dark:bg-gray-800 px-4 py-3"
                        >
                          <span className="text-base font-medium text-gray-900 dark:text-white">{selectedExpiration}</span>
                          <svg className={`w-5 h-5 text-gray-900 dark:text-white transition-transform ${expirationDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Dropdown Options */}
                        {expirationDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                            <div className="py-2">
                              <button
                                onClick={() => {
                                  setSelectedExpiration("End of day");
                                  setExpirationDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <span className="text-base font-medium text-gray-900 dark:text-white">End of day</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedExpiration("45 Minutes");
                                  setExpirationDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <span className="text-base font-medium text-gray-900 dark:text-white">45 Minutes</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Total and To Win */}
                  <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total</span>
                      <span className="text-lg font-bold text-blue-600">
                        ${(() => {
                          const price = parseFloat(limitPrice) || 0;
                          const shareCount = parseFloat(shares) || 0;
                          const total = (price * shareCount) / 100;
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
                          const shareCount = parseFloat(shares) || 0;
                          const winAmount = shareCount - ((parseFloat(limitPrice) || 0) * shareCount / 100);
                          return Math.max(0, winAmount).toFixed(2);
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* To Win Section - shows when amount is entered */}
              {tradeAmount && (
                <div className="mb-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 text-base font-semibold mb-1">
                        <span>To win</span>
                        <span>💰</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 font-medium">
                        <span>Avg. Price {market.outcomes[selectedCandidate]?.probability || 88}¢</span>
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
                            const amount = parseFloat(tradeAmount);
                            const price = (market.outcomes[selectedCandidate]?.probability || 88) / 100;
                            const potentialWin = amount / price;
                            const winString = potentialWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            const length = winString.length;

                            return length <= 6 ? '2.75rem' :
                                   length <= 8 ? '2.25rem' :
                                   length <= 10 ? '1.875rem' :
                                   length <= 12 ? '1.625rem' : '1.375rem';
                          })()
                        }}
                      >
                        ${(() => {
                          const amount = parseFloat(tradeAmount);
                          const price = (market.outcomes[selectedCandidate]?.probability || 88) / 100;
                          const potentialWin = amount / price;
                          return potentialWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trade Button */}
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm mt-4">
                Trade
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Additional Content Below */}
        <div className="max-w-7xl mx-auto px-0 py-0">
          <div className="max-w-4xl">
            {/* Left Column - Market Details */}
            <div className="space-y-6">
              {/* Outcome Section */}
              <div className="mb-2">
                <div className="flex items-center pb-3 border-b border-gray-200 dark:border-gray-700 mb-0">
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      OUTCOME
                    </h2>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        % CHANCE
                      </span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1"></div>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {market.outcomes.map((outcome, index) => (
                    <div key={index} className="flex items-center py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {outcome.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white text-base">
                            {outcome.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ${outcome.volume.toLocaleString()} Vol. 📊
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex justify-center">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {outcome.probability}%
                        </div>
                      </div>
                      <div className="flex gap-2 flex-1 justify-end">
                        <button
                          onClick={() => {
                            setSelectedCandidate(0);
                            setSelectedOutcome(index);
                          }}
                          className={`py-3.5 rounded text-xs font-medium transition-colors w-[100px] text-center ${
                            selectedCandidate === 0 && selectedOutcome === index
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/30"
                          }`}>
                          Buy Yes {outcome.price.yes}¢
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCandidate(1);
                            setSelectedOutcome(index);
                          }}
                          className={`py-3.5 rounded text-xs font-medium transition-colors w-[100px] text-center ${
                            selectedCandidate === 1 && selectedOutcome === index
                              ? "bg-red-600 text-white hover:bg-red-700"
                              : "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/30"
                          }`}>
                          Buy No {outcome.price.no}¢
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules Section */}
              <div className="mb-2">
                <div className="pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Rules
                  </h2>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                    The 2025 New York City mayoral election will be held on November 4, 2025, to elect the mayor of New York City.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Show more</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

            </div>
        </div>
      </div>
    </div>
  );
}