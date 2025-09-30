'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  ChevronDown,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { TopNavClient } from '@/components/nav/TopNavClient';
import { CategoryTabs } from '@/components/nav/CategoryTabs';
import { MarketCard } from '@/components/market/MarketCard';
import { BottomNav } from '@/components/nav/BottomNav';
import { SidePanel } from '@/components/nav/SidePanel';
import { SignUpModal } from '@/components/auth/SignUpModal';
import { useSignUpModalContext } from '@/contexts/SignUpModalContext';
import { useSidePanel } from '@/contexts/SidePanelContext';
import { mockMarkets, extraFeedItems, type Category } from '@/lib/mock';
import { isGroup, type MarketItem } from '@/types/market';
import { isBinaryMarketView } from '@/lib/marketUtils';
import { BinaryCard } from '@/components/market/BinaryCard';
import { GroupCard } from '@/components/market/GroupCard';
import { useAccount, useChainId } from 'wagmi';
import { config } from '@/lib/config';
import { useAuthSafe } from '@/contexts/AuthContext';
import { clientEnv } from '@/lib/env.client';

interface HomePageContentProps {
  realEvents: MarketItem[];
}

export function HomePageContent({ realEvents }: HomePageContentProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('Trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<
    'home' | 'search' | 'breaking' | 'more'
  >('home');
  const { isSidePanelOpen, closeSidePanel } = useSidePanel();
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<
    'volume' | 'newest' | 'oldest' | 'closing'
  >('volume');
  const [showFilterPills, setShowFilterPills] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const {
    isOpen: isSignUpModalOpen,
    mode: signUpModalMode,
    closeModal: closeSignUpModal,
  } = useSignUpModalContext();

  // Wallet and chain state
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isPolygonAmoy = chainId === 80002;

  // Auth state
  const authContext = useAuthSafe();
  const user = authContext?.user || null;

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };

    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortOpen]);

  // Build feed with discriminated union
  const legacyItems: MarketItem[] = mockMarkets.map(m => ({
    kind: 'market',
    ...m,
  }));

  // Combine mock data with real events from database
  const mockFeed: MarketItem[] =
    clientEnv.NODE_ENV === 'development'
      ? [...legacyItems, ...extraFeedItems]
      : legacyItems;

  // Create a map to deduplicate by ID (more reliable than slug)
  const eventMap = new Map<string, MarketItem>();

  // Add mock events first - they provide the base dataset
  mockFeed.forEach(event => {
    if (event.kind === 'market' && event.id) {
      eventMap.set(event.id, event);
    } else if (event.kind === 'group' && event.groupId) {
      // For groups, use groupId as the key
      eventMap.set(`group-${event.groupId}`, event);
    }
  });

  // Add real events (they will override mock events with same ID, or add new ones)
  realEvents.forEach(event => {
    if (event.kind === 'market' && event.id) {
      // Real events override mock events with same ID, or get added as new events
      eventMap.set(event.id, event);
    }
  });

  const feed: MarketItem[] = Array.from(eventMap.values());

  // Debug logging to track data flow
  console.log('🔍 Landing Page Data Flow:');
  console.log('📦 Mock events count:', mockFeed.length);
  console.log(
    '📦 Mock event IDs:',
    mockFeed.map(e =>
      e.kind === 'market' ? e.id : e.kind === 'group' ? e.groupId : 'unknown'
    )
  );
  console.log('🔄 Real events count:', realEvents.length);
  console.log(
    '🔄 Real event IDs:',
    realEvents.map(e =>
      e.kind === 'market' ? e.id : e.kind === 'group' ? e.groupId : 'unknown'
    )
  );
  console.log('🎯 Combined feed count:', feed.length);
  console.log(
    '📋 Final event IDs:',
    feed.map(e =>
      e.kind === 'market' ? e.id : e.kind === 'group' ? e.groupId : 'unknown'
    )
  );

  // TODO: Replace with actual contract data fetching
  const filteredMarkets = feed
    .filter(item => {
      // Handle both legacy markets and new MarketItem types
      const question =
        item.kind === 'market'
          ? item.question
          : item.kind === 'group'
            ? item.title
            : '';

      const matchesCategory =
        activeCategory === 'Trending' ||
        (activeCategory === 'Politics' &&
          question.toLowerCase().includes('election')) ||
        (activeCategory === 'Economy' &&
          (question.toLowerCase().includes('fed') ||
            question.toLowerCase().includes('bitcoin') ||
            question.toLowerCase().includes('tesla') ||
            question.toLowerCase().includes('eth'))) ||
        (activeCategory === 'Naija Picks' &&
          question.toLowerCase().includes('nigerian'));

      const matchesSearch =
        searchQuery === '' ||
        question.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      // For Trending category, maintain original order (Nigerian Presidential Election first)
      if (activeCategory === 'Trending') {
        return 0; // Keep original order
      }

      // For other categories, apply sorting
      const getPoolUsd = (item: MarketItem) =>
        item.kind === 'market' ? item.poolUsd : 0;
      const getClosesAt = (item: MarketItem) =>
        item.kind === 'market' ? item.closesAt : undefined;

      switch (sortBy) {
        case 'volume':
          return getPoolUsd(b) - getPoolUsd(a);
        case 'newest':
          const aClosesAt = getClosesAt(a);
          const bClosesAt = getClosesAt(b);
          if (!aClosesAt || !bClosesAt) return 0;
          return new Date(bClosesAt).getTime() - new Date(aClosesAt).getTime();
        case 'oldest':
          const aClosesAtOld = getClosesAt(a);
          const bClosesAtOld = getClosesAt(b);
          if (!aClosesAtOld || !bClosesAtOld) return 0;
          return (
            new Date(aClosesAtOld).getTime() - new Date(bClosesAtOld).getTime()
          );
        case 'closing':
          const aClosesAtClosing = getClosesAt(a);
          const bClosesAtClosing = getClosesAt(b);
          if (!aClosesAtClosing || !bClosesAtClosing) return 0;
          return (
            new Date(aClosesAtClosing).getTime() -
            new Date(bClosesAtClosing).getTime()
          );
        default:
          return 0;
      }
    });

  const handleMarketAction = (
    action: string,
    marketId: string,
    outcomeIndex?: number
  ) => {
    // TODO: Implement actual market interactions
    console.log(
      `${action} clicked for market ${marketId}`,
      outcomeIndex ? `outcome ${outcomeIndex}` : ''
    );
  };

  const handleTabChange = (tab: 'home' | 'search' | 'breaking' | 'more') => {
    setActiveTab(tab);
    if (tab === 'more') {
      // Side panel will be opened by the context
    } else {
      closeSidePanel();
    }
  };

  const handleSortChange = (
    sort: 'volume' | 'newest' | 'oldest' | 'closing'
  ) => {
    setSortBy(sort);
    setIsSortOpen(false);
  };

  return (
    <div
      className="min-h-screen bg-white dark:bg-[#0b1220] text-gray-900 dark:text-white transition-colors"
      suppressHydrationWarning
    >
      {/* Top Navigation */}
      <TopNavClient />

      {/* Category Tabs */}
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Desktop Search Bar */}
      <div className="hidden md:block mx-auto max-w-7xl px-0 py-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-3 py-2 w-96 shadow-sm">
            <Search className="size-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm placeholder:text-gray-600 dark:placeholder:text-gray-400 focus:outline-none text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowFilterPills(!showFilterPills)}
            className="size-7 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 grid place-items-center transition-colors"
            aria-label="Filter"
          >
            <SlidersHorizontal className="size-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button
            className="size-7 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 grid place-items-center transition-colors"
            aria-label="Bookmark"
          >
            <Bookmark className="size-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Desktop Filter Pills */}
      {showFilterPills && (
        <div className="hidden md:block mx-auto max-w-7xl px-0 py-1">
          <div className="flex items-center gap-2 relative">
            <button
              onMouseDown={e => {
                e.preventDefault();
                setIsSortOpen(!isSortOpen);
              }}
              className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap transition-colors"
            >
              Sort by:{' '}
              {sortBy === 'volume'
                ? '24hr Volume'
                : sortBy === 'newest'
                  ? 'Newest'
                  : sortBy === 'oldest'
                    ? 'Oldest'
                    : 'Closing Soon'}
              <ChevronDown className="size-3" />
            </button>

            <button className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap transition-colors">
              Frequency: All
              <ChevronDown className="size-3" />
            </button>

            <button className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap transition-colors">
              Status: Active
              <ChevronDown className="size-3" />
            </button>

            {/* Desktop Sort Dropdown */}
            {isSortOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 min-w-[200px]">
                <div className="p-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">
                    Sort by
                  </div>
                  <button
                    onClick={() => handleSortChange('volume')}
                    className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      sortBy === 'volume'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    24hr Volume
                  </button>
                  <button
                    onClick={() => handleSortChange('newest')}
                    className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      sortBy === 'newest'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => handleSortChange('oldest')}
                    className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      sortBy === 'oldest'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Oldest
                  </button>
                  <button
                    onClick={() => handleSortChange('closing')}
                    className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      sortBy === 'closing'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Closing Soon
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Search Bar */}
      <div className="md:hidden mx-auto max-w-[680px] px-3 py-3 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-3 py-2">
          <Search className="size-4 text-gray-600 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm placeholder:text-gray-600 dark:placeholder:text-gray-400 focus:outline-none text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={() => setShowFilterPills(!showFilterPills)}
          className="size-9 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 grid place-items-center transition-colors"
          aria-label="Toggle Filters"
        >
          <SlidersHorizontal className="size-4 text-gray-700 dark:text-gray-300" />
        </button>
        <button
          className="size-9 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 grid place-items-center transition-colors"
          aria-label="Bookmark"
        >
          <Bookmark className="size-4 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Filter Pills */}
      {showFilterPills && (
        <div
          ref={sortRef}
          className="md:hidden mx-auto max-w-[680px] px-3 py-1 relative"
        >
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onMouseDown={e => {
                e.preventDefault();
                setIsSortOpen(!isSortOpen);
              }}
              className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap transition-colors"
            >
              Sort by:{' '}
              {sortBy === 'volume'
                ? '24hr Volume'
                : sortBy === 'newest'
                  ? 'Newest'
                  : sortBy === 'oldest'
                    ? 'Oldest'
                    : 'Closing Soon'}
              <ChevronDown className="size-3" />
            </button>

            <button className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap transition-colors">
              Frequency: All
              <ChevronDown className="size-3" />
            </button>

            <button className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap transition-colors">
              Status: Active
              <ChevronDown className="size-3" />
            </button>

            {/* Sort Dropdown */}
            {isSortOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 min-w-[200px]">
                <div className="p-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">
                    Sort by
                  </div>
                  <button
                    onClick={() => handleSortChange('volume')}
                    className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      sortBy === 'volume'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    24hr Volume
                  </button>
                  <button
                    onClick={() => handleSortChange('newest')}
                    className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      sortBy === 'newest'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => handleSortChange('oldest')}
                    className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      sortBy === 'oldest'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Oldest
                  </button>
                  <button
                    onClick={() => handleSortChange('closing')}
                    className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      sortBy === 'closing'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Closing Soon
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Market Cards */}
      <main className="mx-auto max-w-7xl px-4 md:px-0 py-1 md:py-4 pb-20 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMarkets.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No markets found
              </p>
            </div>
          ) : (
            filteredMarkets.map(item => {
              if (isGroup(item)) {
                return <GroupCard key={item.groupId} group={item} />;
              }
              if (item.kind === 'market' && isBinaryMarketView(item)) {
                return <BinaryCard key={item.id} market={item} />;
              }
              // Fallback to your original card for legacy markets
              // At this point, item must be a market (not group)
              if (item.kind === 'market') {
                return (
                  <MarketCard
                    key={item.id}
                    market={item as any}
                    onYesClick={(marketId, outcomeIndex) =>
                      handleMarketAction('Yes', marketId, outcomeIndex)
                    }
                    onNoClick={(marketId, outcomeIndex) =>
                      handleMarketAction('No', marketId, outcomeIndex)
                    }
                  />
                );
              }
              // This should never happen, but TypeScript needs it
              return null;
            })
          )}
        </div>
      </main>

      {/* Bottom Navigation - Hidden on desktop */}
      <div className="lg:hidden">
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          user={user}
        />
      </div>

      {/* Side Panel */}
      <SidePanel isOpen={isSidePanelOpen} onClose={closeSidePanel} />

      {/* Sign Up Modal */}
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={closeSignUpModal}
        mode={signUpModalMode}
      />

      {/* Dev Network Badge */}
      {clientEnv.NODE_ENV !== 'production' && (
        <div className="fixed bottom-3 right-3 text-xs px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800/80 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700">
          Network: Localhost 8545
        </div>
      )}
    </div>
  );
}
