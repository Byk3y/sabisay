"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { mockMarkets, type Category } from "@/lib/mock";
import { TopNavClient } from "@/components/nav/TopNavClient";
import { CategoryTabs } from "@/components/nav/CategoryTabs";
import { MarketHeader } from "@/features/market/components/MarketHeader";
import { ChartPlaceholder } from "@/features/market/components/ChartPlaceholder";
import { OutcomeRow } from "@/features/market/components/OutcomeRow";
import { TradePanel } from "@/features/market/components/TradePanel";
import { StateBanner } from "@/features/market/components/StateBanner";

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
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [activeCategory, setActiveCategory] = useState<Category>("Trending");
  const [selectedCandidate, setSelectedCandidate] = useState(0);
  const [selectedOutcome, setSelectedOutcome] = useState(0);

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
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Market Details */}
          <section className="lg:col-span-2 space-y-6">
            {/* Market Header */}
            <MarketHeader
              title={market.title}
              volume={market.volume}
              endDate={market.endDate}
              onShare={() => console.log('Share clicked')}
              onBookmark={() => console.log('Bookmark clicked')}
            />

            {/* Chart Section */}
            <ChartPlaceholder outcomes={market.outcomes} />

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
                  <OutcomeRow
                    key={index}
                    outcome={outcome}
                    index={index}
                    isSelected={selectedOutcome === index}
                    selectedCandidate={selectedCandidate}
                    onSelect={(candidate, outcomeIndex) => {
                      setSelectedCandidate(candidate);
                      setSelectedOutcome(outcomeIndex);
                    }}
                  />
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
          </section>

          {/* Right Column - Trading Sidebar */}
          <aside className="lg:col-span-1 lg:sticky lg:top-24 space-y-4">
            <TradePanel
              selectedOutcome={market.outcomes[selectedOutcome]}
              onTrade={(amount, isYes) => {
                console.log('Trade:', { amount, isYes, outcome: market.outcomes[selectedOutcome] });
              }}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}