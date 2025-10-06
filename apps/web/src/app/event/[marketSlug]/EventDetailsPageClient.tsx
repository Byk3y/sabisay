'use client';

import React, { useState, useEffect } from 'react';
import { TopNavClient } from '@/components/nav/TopNavClient';
import { CategoryTabs } from '@/components/nav/CategoryTabs';
import { MarketHeader } from '@/components/market/MarketHeader';
import { MarketChart } from '@/components/market/charts/MarketChart';
import { TradingSidebar } from '@/components/market/TradingSidebar';
import { isBinaryMarketView, getMarketBySlug } from '@/lib/marketUtils';
import type { Market } from '@/types/market';
import { OutcomeList } from '@/components/market/OutcomeList';
import { RulesSection } from '@/components/market/RulesSection';
import { MobileOverlay } from '@/components/ui/MobileOverlay';
import { BottomNav } from '@/components/nav/BottomNav';
import { SidePanel } from '@/components/nav/SidePanel';
import { useMarketUI } from '@/hooks/useMarketUI';
import { useTradingState } from '@/hooks/useTradingState';
import { SidePanelProvider, useSidePanel } from '@/contexts/SidePanelContext';
import {
  generateChanceSeries,
  generateMultiSeries,
  type TimeRange,
} from '@/lib/mockSeries';
import type { TradeData } from '@/types/market';
import { getDefaultOutcomeColor } from '@/lib/colors';

// Helper function to fetch event by slug from database
async function fetchEventBySlug(slug: string): Promise<Market | null> {
  try {
    const response = await fetch(`/api/events/${slug}`);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.success && data.data) {
      const event = data.data;

      // Transform database event to Market format
      const outcomes =
        event.outcomes && event.outcomes.length > 0
          ? event.outcomes.map((outcome: any, index: number) => ({
              label: outcome.label,
              oddsPct: 50, // Default odds since we don't have real pricing yet
              probability: 50,
              price: { yes: 50, no: 50 }, // Default pricing
              color: outcome.color ?? getDefaultOutcomeColor(index),
            }))
          : [
              {
                label: 'Yes',
                oddsPct: 50,
                probability: 50,
                price: { yes: 50, no: 50 },
                color: getDefaultOutcomeColor(0),
              },
              {
                label: 'No',
                oddsPct: 50,
                probability: 50,
                price: { yes: 50, no: 50 },
                color: getDefaultOutcomeColor(1),
              },
            ];

      const market: Market = {
        id: event.id.toString(),
        title: event.title,
        outcomes: outcomes,
        volume: 1000000, // Default volume
        endDate: new Date(event.close_time), // Convert to Date object for MarketHeader
        relatedMarkets: [],
        slug: event.slug,
        rules: event.rules,
      };

      // Only add optional fields if they exist
      if (event.type === 'binary') {
        market.uiStyle = 'binary';
      }
      if (event.imageCid) {
        // Check if it's already a full URL (Supabase Storage) or just a CID (IPFS)
        if (event.imageCid.startsWith('http')) {
          market.imageUrl = event.imageCid;
        } else {
          market.imageUrl = `https://gateway.pinata.cloud/ipfs/${event.imageCid}`;
        }
      }

      return market;
    }

    return null;
  } catch (error) {
    console.error('Error fetching event from database:', error);
    return null;
  }
}

interface EventDetailsPageClientProps {
  marketSlug: string;
}

function EventDetailsPageContent({
  marketSlug,
}: EventDetailsPageClientProps): React.JSX.Element {
  // Get market data using slug-based lookup
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMarket = async () => {
      setIsLoading(true);
      try {
        // Try to fetch from database first
        console.log(`🔍 Loading market: ${marketSlug}`);
        const dbMarket = await fetchEventBySlug(marketSlug);

        if (dbMarket) {
          console.log('✅ Found market in database:', dbMarket.title);
          setMarket(dbMarket);
        } else {
          // Fallback to mock data
          console.log('📦 Market not found in database, trying mock data...');
          const mockMarket = getMarketBySlug(marketSlug);

          if (mockMarket) {
            console.log('✅ Found market in mock data:', mockMarket.title);
            setMarket(mockMarket);
          } else {
            console.error(
              `❌ Market not found in database or mock data: ${marketSlug}`
            );
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error loading market:', error);
        setIsLoading(false);
      }
    };

    if (marketSlug) {
      loadMarket();
    } else {
      setIsLoading(false);
    }
  }, [marketSlug]);

  const { activeCategory, isMobile, setActiveCategory } = useMarketUI();

  // Market data is already in the correct format

  const {
    tradeAmount,
    tradeType,
    selectedCandidate,
    selectedOutcome,
    orderType,
    limitPrice,
    shares,
    expirationEnabled,
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

    if (market && isBinaryMarketView(market)) {
      // For binary markets, generate single series
      const currentChance = market.outcomes?.[0]?.probability || 50;
      return generateChanceSeries(market.id, timeRange, currentChance);
    } else {
      // For multi-outcome markets, generate multiple series with colors
      const outcomes = market.outcomes || [];
      return generateMultiSeries(market.id, timeRange, outcomes);
    }
  }, [market, timeRange]);

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
        className={`max-w-7xl mx-auto px-0 py-6 ${isMobile && market && isBinaryMarketView(market) ? 'pb-24' : ''}`}
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
              isBinaryMarket={!!(market && isBinaryMarketView(market))}
            />

            {/* Chart Section */}
            <div className="mb-6">
              <MarketChart
                variant={
                  market && isBinaryMarketView(market) ? 'chance' : 'multi'
                }
                series={chartData}
                showChanceHeader={!!(market && isBinaryMarketView(market))}
                currentChancePct={
                  market && isBinaryMarketView(market)
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
              isBinaryMarket={!!(market && isBinaryMarketView(market))}
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
            isMobile ? 'md:pr-0 pb-20' : 'md:pr-[360px] pb-12'
          }`}
        >
          <div className="space-y-6">
            {/* Outcome Section - Hide for chance markets */}
            {!(market && isBinaryMarketView(market)) && (
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
            {market?.rules && (
              <RulesSection
                rules={market.rules}
                onShowMore={() => console.log('Show more rules')}
              />
            )}
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
            isBinaryMarket={!!(market && isBinaryMarketView(market))}
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
      {isMobile && market && isBinaryMarketView(market) && (
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

export default function EventDetailsPageClient({
  marketSlug,
}: EventDetailsPageClientProps) {
  return (
    <SidePanelProvider>
      <EventDetailsPageContent marketSlug={marketSlug} />
    </SidePanelProvider>
  );
}
