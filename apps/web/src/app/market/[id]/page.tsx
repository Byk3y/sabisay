"use client";

import { useParams } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { TopNavClient } from "@/components/nav/TopNavClient";
import { CategoryTabs } from "@/components/nav/CategoryTabs";
import { MarketHeader } from "@/components/market/MarketHeader";
import { MarketChart } from "@/components/market/MarketChart";
import { TradingSidebar } from "@/components/market/TradingSidebar";
import { OutcomeList } from "@/components/market/OutcomeList";
import { RulesSection } from "@/components/market/RulesSection";
import { useMarketData } from "@/hooks/useMarketData";
import { useMarketUI } from "@/hooks/useMarketUI";
import { useTradingState } from "@/hooks/useTradingState";
import type { TradeData, Category } from "@/types/market";

export default function MarketDetailsPage() {
  const params = useParams();
  const { mounted } = useTheme();
  const marketId = params.id as string;
  
  // Use custom hooks for state management
  const { market, isLoading } = useMarketData(marketId);
  const { activeTab, activeCategory, isInputFocused, setActiveCategory } = useMarketUI();
  const {
    tradeAmount,
    tradeType,
    selectedCandidate,
    selectedOutcome,
    orderType,
    limitPrice,
    shares,
    expirationEnabled,
    expirationDropdownOpen,
    selectedExpiration,
    setTradeAmount,
    setTradeType,
    setSelectedCandidate,
    setSelectedOutcome,
    setOrderType,
    setLimitPrice,
    setShares,
    setExpirationEnabled,
    setExpirationDropdownOpen,
    setSelectedExpiration,
    handleOutcomeAndCandidateSelect
  } = useTradingState();

  // Event handlers
  const handleShare = () => {
    console.log('Share market:', market?.title);
  };

  const handleBookmark = () => {
    console.log('Bookmark market:', market?.title);
  };

  const handleTrade = (tradeData: TradeData) => {
    console.log('Execute trade:', tradeData);
  };

  const handleTimePeriodChange = (period: string) => {
    console.log('Time period changed:', period);
  };

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
            {/* Market Header */}
            <MarketHeader 
              market={market} 
              onShare={handleShare} 
              onBookmark={handleBookmark} 
            />

            {/* Chart Section */}
            <MarketChart 
              outcomes={market.outcomes} 
              onTimePeriodChange={handleTimePeriodChange} 
            />
          </div>

          {/* Right Column - Trading Sidebar */}
          <TradingSidebar
            market={market}
            selectedOutcome={selectedOutcome}
            selectedCandidate={selectedCandidate}
            tradeAmount={tradeAmount}
            tradeType={tradeType}
            orderType={orderType}
            limitPrice={limitPrice}
            shares={shares}
            expirationEnabled={expirationEnabled}
            selectedExpiration={selectedExpiration}
            onTrade={handleTrade}
            onOutcomeSelect={handleOutcomeAndCandidateSelect}
            onCandidateSelect={setSelectedCandidate}
            onAmountChange={setTradeAmount}
            onOrderTypeChange={setOrderType}
            onTradeTypeChange={setTradeType}
            onLimitPriceChange={setLimitPrice}
            onSharesChange={setShares}
            onExpirationToggle={setExpirationEnabled}
            onExpirationSelect={setSelectedExpiration}
          />
        </div>
      </div>

      {/* Additional Content Below */}
        <div className="max-w-7xl mx-auto px-0 py-0">
          <div className="max-w-4xl">
            <div className="space-y-6">
              {/* Outcome Section */}
            <OutcomeList
              outcomes={market.outcomes}
              selectedOutcome={selectedOutcome}
              selectedCandidate={selectedCandidate}
              onOutcomeSelect={handleOutcomeAndCandidateSelect}
            />

              {/* Rules Section */}
            <RulesSection 
              rules="The 2025 New York City mayoral election will be held on November 4, 2025, to elect the mayor of New York City."
              onShowMore={() => console.log('Show more rules')}
            />
            </div>
        </div>
      </div>
    </div>
  );
}