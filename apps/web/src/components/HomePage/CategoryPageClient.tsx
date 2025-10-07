'use client';

import { useState, useEffect, useRef } from 'react';
import { TopNavClient } from '@/components/nav/TopNavClient';
import { CategoryTabs } from '@/components/nav/CategoryTabs';
import { MarketCard } from '@/components/market/MarketCard';
import { BottomNav } from '@/components/nav/BottomNav';
import { SidePanel } from '@/components/nav/SidePanel';
import { SidePanelProvider, useSidePanel } from '@/contexts/SidePanelContext';
import { useSignUpModalContext } from '@/contexts/SignUpModalContext';
import { useAuthSafe } from '@/contexts/AuthContext';
import { useAccount, useChainId } from 'wagmi';
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  ChevronDown,
  TrendingUp,
  Clock,
  Calendar,
  ArrowUpDown,
} from 'lucide-react';
import { MarketItem } from '@/types/market';
import { categories } from '@/lib/mock';
import { clientEnv } from '@/lib/env';
import type { Category } from '@/types/market';

interface CategoryPageClientProps {
  realEvents: MarketItem[];
  category: string;
  categorySlug: string;
}

export function CategoryPageClient({
  realEvents,
  category,
  categorySlug,
}: CategoryPageClientProps) {
  const [activeCategory, setActiveCategory] = useState<Category>(
    category as Category
  );
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

  // Use only real events from database
  const feed: MarketItem[] = realEvents;

  // Enhanced category filtering logic
  const getCategoryFilter = (categoryName: string) => {
    const lowerCategory = categoryName.toLowerCase();

    switch (lowerCategory) {
      case 'politics':
        return (item: MarketItem) => {
          const question =
            item.kind === 'market'
              ? item.question
              : item.kind === 'group'
                ? item.title
                : '';
          return (
            question.toLowerCase().includes('election') ||
            question.toLowerCase().includes('president') ||
            question.toLowerCase().includes('government') ||
            question.toLowerCase().includes('political') ||
            question.toLowerCase().includes('vote') ||
            question.toLowerCase().includes('candidate')
          );
        };

      case 'breaking':
        return (item: MarketItem) => {
          const question =
            item.kind === 'market'
              ? item.question
              : item.kind === 'group'
                ? item.title
                : '';
          return (
            question.toLowerCase().includes('breaking') ||
            question.toLowerCase().includes('urgent') ||
            question.toLowerCase().includes('alert') ||
            question.toLowerCase().includes('crisis') ||
            question.toLowerCase().includes('emergency')
          );
        };

      case 'crypto':
        return (item: MarketItem) => {
          const question =
            item.kind === 'market'
              ? item.question
              : item.kind === 'group'
                ? item.title
                : '';
          return (
            question.toLowerCase().includes('bitcoin') ||
            question.toLowerCase().includes('ethereum') ||
            question.toLowerCase().includes('crypto') ||
            question.toLowerCase().includes('blockchain') ||
            question.toLowerCase().includes('defi') ||
            question.toLowerCase().includes('nft')
          );
        };

      case 'economy':
        return (item: MarketItem) => {
          const question =
            item.kind === 'market'
              ? item.question
              : item.kind === 'group'
                ? item.title
                : '';
          return (
            question.toLowerCase().includes('fed') ||
            question.toLowerCase().includes('inflation') ||
            question.toLowerCase().includes('gdp') ||
            question.toLowerCase().includes('recession') ||
            question.toLowerCase().includes('market') ||
            question.toLowerCase().includes('economy')
          );
        };

      case 'sports':
        return (item: MarketItem) => {
          const question =
            item.kind === 'market'
              ? item.question
              : item.kind === 'group'
                ? item.title
                : '';
          return (
            question.toLowerCase().includes('sport') ||
            question.toLowerCase().includes('football') ||
            question.toLowerCase().includes('basketball') ||
            question.toLowerCase().includes('soccer') ||
            question.toLowerCase().includes('championship') ||
            question.toLowerCase().includes('tournament')
          );
        };

      case 'tech':
        return (item: MarketItem) => {
          const question =
            item.kind === 'market'
              ? item.question
              : item.kind === 'group'
                ? item.title
                : '';
          return (
            question.toLowerCase().includes('tech') ||
            question.toLowerCase().includes('ai') ||
            question.toLowerCase().includes('artificial intelligence') ||
            question.toLowerCase().includes('software') ||
            question.toLowerCase().includes('startup') ||
            question.toLowerCase().includes('innovation')
          );
        };

      case 'naija picks':
        return (item: MarketItem) => {
          const question =
            item.kind === 'market'
              ? item.question
              : item.kind === 'group'
                ? item.title
                : '';
          return (
            question.toLowerCase().includes('nigerian') ||
            question.toLowerCase().includes('nigeria') ||
            question.toLowerCase().includes('naija') ||
            question.toLowerCase().includes('lagos') ||
            question.toLowerCase().includes('abuja')
          );
        };

      case 'world':
        return (item: MarketItem) => {
          const question =
            item.kind === 'market'
              ? item.question
              : item.kind === 'group'
                ? item.title
                : '';
          return (
            question.toLowerCase().includes('world') ||
            question.toLowerCase().includes('global') ||
            question.toLowerCase().includes('international') ||
            question.toLowerCase().includes('united nations') ||
            question.toLowerCase().includes('climate')
          );
        };

      case 'geopolitics':
        return (item: MarketItem) => {
          const question =
            item.kind === 'market'
              ? item.question
              : item.kind === 'group'
                ? item.title
                : '';
          return (
            question.toLowerCase().includes('war') ||
            question.toLowerCase().includes('conflict') ||
            question.toLowerCase().includes('treaty') ||
            question.toLowerCase().includes('diplomacy') ||
            question.toLowerCase().includes('sanctions')
          );
        };

      case 'culture':
        return (item: MarketItem) => {
          const question =
            item.kind === 'market'
              ? item.question
              : item.kind === 'group'
                ? item.title
                : '';
          return (
            question.toLowerCase().includes('culture') ||
            question.toLowerCase().includes('entertainment') ||
            question.toLowerCase().includes('music') ||
            question.toLowerCase().includes('movie') ||
            question.toLowerCase().includes('celebrity')
          );
        };

      case 'earnings':
        return (item: MarketItem) => {
          const question =
            item.kind === 'market'
              ? item.question
              : item.kind === 'group'
                ? item.title
                : '';
          return (
            question.toLowerCase().includes('earnings') ||
            question.toLowerCase().includes('quarterly') ||
            question.toLowerCase().includes('revenue') ||
            question.toLowerCase().includes('profit') ||
            question.toLowerCase().includes('stock')
          );
        };

      case 'new':
        return (item: MarketItem) => {
          // For "new" category, show items created in the last 7 days
          const now = new Date();
          const sevenDaysAgo = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000
          );

          if (item.kind === 'market' && item.closesAt) {
            const closesAt = new Date(item.closesAt);
            return closesAt > sevenDaysAgo;
          }
          return false;
        };

      default:
        return () => true;
    }
  };

  // Filter markets based on category and search
  const filteredMarkets = feed
    .filter(item => {
      const question =
        item.kind === 'market'
          ? item.question
          : item.kind === 'group'
            ? item.title
            : '';

      const matchesCategory = getCategoryFilter(category)(item);
      const matchesSearch =
        searchQuery === '' ||
        question.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
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
    // Handle market action
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
              placeholder={`Search ${category.toLowerCase()}...`}
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
        <div className="hidden md:block mx-auto max-w-7xl px-0 py-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Sort by:
              </span>
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {sortBy === 'volume' && (
                    <>
                      <TrendingUp className="size-4" />
                      Volume
                    </>
                  )}
                  {sortBy === 'newest' && (
                    <>
                      <Clock className="size-4" />
                      Newest
                    </>
                  )}
                  {sortBy === 'oldest' && (
                    <>
                      <Calendar className="size-4" />
                      Oldest
                    </>
                  )}
                  {sortBy === 'closing' && (
                    <>
                      <ArrowUpDown className="size-4" />
                      Closing Soon
                    </>
                  )}
                  <ChevronDown className="size-4" />
                </button>

                {isSortOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 z-50">
                    {[
                      { value: 'volume', label: 'Volume', icon: TrendingUp },
                      { value: 'newest', label: 'Newest', icon: Clock },
                      { value: 'oldest', label: 'Oldest', icon: Calendar },
                      {
                        value: 'closing',
                        label: 'Closing Soon',
                        icon: ArrowUpDown,
                      },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => handleSortChange(value as any)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Icon className="size-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Market Cards - Same layout as trending page */}
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
              if (item.kind === 'market') {
                return (
                  <MarketCard
                    key={item.id}
                    market={item as any} // Type assertion for now
                    onYesClick={(marketId, outcomeIndex) =>
                      handleMarketAction('yes', marketId, outcomeIndex)
                    }
                    onNoClick={(marketId, outcomeIndex) =>
                      handleMarketAction('no', marketId, outcomeIndex)
                    }
                  />
                );
              }
              // Handle group items differently if needed
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
    </div>
  );
}
