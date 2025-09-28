'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { TopNavClient } from '@/components/nav/TopNavClient';
import { CategoryTabs } from '@/components/nav/CategoryTabs';
import { MarketHeader } from '@/components/market/MarketHeader';
import { MarketChart } from '@/components/market/charts/MarketChart';
import { TradingSidebar } from '@/components/market/TradingSidebar';
import { type MarketItem } from '@/types/market';
import { isBinaryMarketView } from '@/lib/marketUtils';
import { OutcomeList } from '@/components/market/OutcomeList';
import { RulesSection } from '@/components/market/RulesSection';
import { MobileOverlay } from '@/components/ui/MobileOverlay';
import { BottomNav } from '@/components/nav/BottomNav';
import { SidePanel } from '@/components/nav/SidePanel';
import { useMarketData } from '@/hooks/useMarketData';
import { useMarketUI } from '@/hooks/useMarketUI';
import { useTradingState } from '@/hooks/useTradingState';
import { SidePanelProvider, useSidePanel } from '@/contexts/SidePanelContext';
import {
  generateChanceSeries,
  generateMultiSeries,
  type TimeRange,
} from '@/lib/mockSeries';
import type { TradeData, Category } from '@/types/market';

function MarketDetailsPageContent() {
  const params = useParams();
  const { mounted } = useTheme();
  const marketId = params.id as string;

  // Use custom hooks for state management
  const { market, isLoading } = useMarketData(marketId);
  const {
    activeTab,
    activeCategory,
    isInputFocused,
    isMobile,
    setActiveCategory,
  } = useMarketUI();

  // Convert market to MarketItem format for type checking
  const marketItem: MarketItem | null = market
    ? {
        kind: 'market',
        id: market.id,
        question: market.title,
        poolUsd: market.volume,
        ...(market.uiStyle && { uiStyle: market.uiStyle }), // Add this line to preserve uiStyle
        outcomes: market.outcomes.map(outcome => ({
          label: outcome.name,
          oddsPct: outcome.probability,
        })),
      }
    : null;
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
    isMobileSidebarOpen,
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
    setIsMobileSidebarOpen,
    handleOutcomeAndCandidateSelect,
  } = useTradingState();

  // Side panel state
  const { isSidePanelOpen, openSidePanel, closeSidePanel } = useSidePanel();

  // Chart state
  const [timeRange, setTimeRange] = useState<TimeRange>('1D');

  // Generate chart data based on market type
  const chartData = React.useMemo(() => {
    if (!market) return [];

    if (marketItem && isBinaryMarketView(marketItem)) {
      // For binary markets, generate single series
      const currentChance = market.outcomes?.[0]?.probability || 50;
      return generateChanceSeries(marketId, timeRange, currentChance);
    } else {
      // For multi-outcome markets, generate multiple series
      const labels = market.outcomes?.map(outcome => outcome.name) || [];
      return generateMultiSeries(marketId, timeRange, labels);
    }
  }, [market, marketItem, marketId, timeRange]);

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
    setTimeRange(period as TimeRange);
    console.log('Time period changed:', period);
  };

  // Mobile-specific handlers
  const handleMobileSidebarOpen = () => {
    setIsMobileSidebarOpen(true);
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
    setTradeAmount(''); // Reset trade amount when modal closes
  };

  const handleSidePanelOpen = () => {
    openSidePanel();
  };

  const handleSidePanelClose = () => {
    closeSidePanel();
  };

  // Cleanup effect to restore body scroll on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Effect to handle body scroll based on mobile sidebar state
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileSidebarOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b1220] text-gray-900 dark:text-white transition-colors">
        <TopNavClient />
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
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
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Market Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The market you're looking for doesn't exist.
            </p>
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
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Main Content */}
      <div
        className={`max-w-7xl mx-auto px-0 py-6 ${isMobile && marketItem && isBinaryMarketView(marketItem) ? 'pb-24' : ''}`}
      >
        <div className="relative">
          {/* Left Column - Market Details */}
          <div
            className={`space-y-6 pr-4 px-4 md:px-0 ${
              isMobile
                ? 'md:pr-0'
                : 'md:pr-[360px] max-h-[calc(100vh-200px)] overflow-y-auto'
            }`}
          >
            {/* Market Header */}
            <MarketHeader
              market={market}
              onShare={handleShare}
              onBookmark={handleBookmark}
              isMobile={isMobile}
              isBinaryMarket={!!(marketItem && isBinaryMarketView(marketItem))}
            />

            {/* Chart Section */}
            <div className="mb-6">
              <MarketChart
                variant={
                  marketItem && isBinaryMarketView(marketItem)
                    ? 'chance'
                    : 'multi'
                }
                series={chartData}
                showChanceHeader={
                  !!(marketItem && isBinaryMarketView(marketItem))
                }
                currentChancePct={
                  marketItem && isBinaryMarketView(marketItem)
                    ? market.outcomes?.[0]?.probability
                    : 50
                }
                timeRange={timeRange}
              />

              {/* Time range buttons */}
              <div className="flex items-center gap-2 mt-4">
                {(['1H', '6H', '1D', '1W', '1M', 'ALL'] as TimeRange[]).map(
                  period => (
                    <button
                      key={period}
                      onClick={() => handleTimePeriodChange(period)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        timeRange === period
                          ? 'bg-gray-200 dark:bg-gray-600 text-black dark:text-white font-semibold'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {period}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Trading Sidebar - Desktop Only */}
          {!isMobile && (
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
              isBinaryMarket={!!(marketItem && isBinaryMarketView(marketItem))}
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
          )}
        </div>
      </div>

      {/* Additional Content Below */}
      <div className="max-w-7xl mx-auto px-0 py-0">
        <div
          className={`px-4 md:px-0 ${
            isMobile ? 'md:pr-0 pb-20' : 'md:pr-[360px]'
          }`}
        >
          <div className="space-y-6">
            {/* Outcome Section - Hide for chance markets */}
            {!(marketItem && isBinaryMarketView(marketItem)) && (
              <OutcomeList
                outcomes={market.outcomes}
                selectedOutcome={selectedOutcome}
                selectedCandidate={selectedCandidate}
                onOutcomeSelect={handleOutcomeAndCandidateSelect}
                isMobile={isMobile}
                onMobileSidebarOpen={handleMobileSidebarOpen}
              />
            )}

            {/* Rules Section */}
            <RulesSection
              rules="The 2025 New York City mayoral election will be held on November 4, 2025, to elect the mayor of New York City."
              onShowMore={() => console.log('Show more rules')}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar and Overlay */}
      {isMobile && (
        <>
          <MobileOverlay
            isOpen={isMobileSidebarOpen}
            onClose={handleMobileSidebarClose}
          />
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
            isMobile={isMobile}
            isMobileSidebarOpen={isMobileSidebarOpen}
            isBinaryMarket={!!(marketItem && isBinaryMarketView(marketItem))}
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
            onMobileSidebarClose={handleMobileSidebarClose}
          />
        </>
      )}

      {/* Mobile Chance Market Buttons - Only for chance markets on mobile */}
      {isMobile && marketItem && isBinaryMarketView(marketItem) && (
        <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2 bg-white dark:bg-gray-900">
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelectedOutcome(0);
                setSelectedCandidate(0);
                setTradeType('buy');
                setIsMobileSidebarOpen(true);
              }}
              className="flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-colors duration-200"
            >
              Buy Yes {market?.outcomes[0]?.price?.yes}¢
            </button>
            <button
              onClick={() => {
                setSelectedOutcome(0);
                setSelectedCandidate(1);
                setTradeType('buy');
                setIsMobileSidebarOpen(true);
              }}
              className="flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-colors duration-200"
            >
              Buy No {market?.outcomes[0]?.price?.no}¢
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Mobile only */}
      {isMobile && (
        <BottomNav
          activeTab="home"
          onTabChange={tab => {
            if (tab === 'more') {
              handleSidePanelOpen();
            } else {
              console.log('Tab changed to:', tab);
            }
          }}
        />
      )}

      {/* Side Panel - Mobile only */}
      {isMobile && (
        <SidePanel isOpen={isSidePanelOpen} onClose={handleSidePanelClose} />
      )}
    </div>
  );
}

export default function MarketDetailsPage() {
  return (
    <SidePanelProvider>
      <MarketDetailsPageContent />
    </SidePanelProvider>
  );
}
