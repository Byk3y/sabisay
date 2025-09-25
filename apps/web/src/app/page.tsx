"use client";

import { useState, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, Bookmark, ChevronDown, Wifi, WifiOff } from "lucide-react";
import { TopNavClient } from "@/components/nav/TopNavClient";
import { CategoryTabs } from "@/components/nav/CategoryTabs";
import { MarketCard } from "@/components/market/MarketCard";
import { BottomNav } from "@/components/nav/BottomNav";
import { SidePanel } from "@/components/nav/SidePanel";
import { WalletConnect } from "@/components/wallet-connect";
import { SignUpModal } from "@/components/auth/SignUpModal";
import { useSignUpModalContext } from "@/contexts/SignUpModalContext";
import { mockMarkets, type Category } from "@/lib/mock";
import { useAccount, useChainId } from "wagmi";
import { config } from "@/lib/config";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<Category>("Trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"home" | "search" | "breaking" | "more">("home");
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"volume" | "newest" | "oldest" | "closing">("volume");
  const [showFilterPills, setShowFilterPills] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const { isOpen: isSignUpModalOpen, mode: signUpModalMode, closeModal: closeSignUpModal } = useSignUpModalContext();

  // Wallet and chain state
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isLocalChain = chainId === config.local.chainId;

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

  // TODO: Replace with actual contract data fetching
  const filteredMarkets = mockMarkets.filter(market => {
    const matchesCategory = activeCategory === "Trending" || 
      (activeCategory === "Politics" && market.question.toLowerCase().includes("election")) ||
      (activeCategory === "Economy" && (market.question.toLowerCase().includes("fed") || market.question.toLowerCase().includes("bitcoin") || market.question.toLowerCase().includes("tesla"))) ||
      (activeCategory === "Naija Picks" && market.question.toLowerCase().includes("nigerian"));
    
    const matchesSearch = searchQuery === "" || 
      market.question.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    // For Trending category, maintain original order (Nigerian Presidential Election first)
    if (activeCategory === "Trending") {
      return 0; // Keep original order
    }
    
    // For other categories, apply sorting
    switch (sortBy) {
      case "volume":
        return b.poolUsd - a.poolUsd;
      case "newest":
        if (!a.closesAt || !b.closesAt) return 0;
        return new Date(b.closesAt).getTime() - new Date(a.closesAt).getTime();
      case "oldest":
        if (!a.closesAt || !b.closesAt) return 0;
        return new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime();
      case "closing":
        if (!a.closesAt || !b.closesAt) return 0;
        return new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime();
      default:
        return 0;
    }
  });

  const handleMarketAction = (action: string, marketId: string, outcomeIndex?: number) => {
    // TODO: Implement actual market interactions
    console.log(`${action} clicked for market ${marketId}`, outcomeIndex ? `outcome ${outcomeIndex}` : '');
  };

  const handleTabChange = (tab: "home" | "search" | "breaking" | "more") => {
    setActiveTab(tab);
    if (tab === "more") {
      setIsSidePanelOpen(true);
    } else {
      setIsSidePanelOpen(false);
    }
  };

  const handleSortChange = (sort: "volume" | "newest" | "oldest" | "closing") => {
    setSortBy(sort);
    setIsSortOpen(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1220] text-gray-900 dark:text-white transition-colors">
      {/* Top Navigation */}
      <TopNavClient />


      {/* Category Tabs */}
      <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* Desktop Search Bar */}
        <div className="hidden md:block mx-auto max-w-7xl px-0 py-2">
              <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-3 py-2 w-96 shadow-sm">
                                <Search className="size-4 text-gray-500 dark:text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Search"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
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
                              <button className="size-7 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 grid place-items-center transition-colors" aria-label="Bookmark">
                                <Bookmark className="size-4 text-gray-500 dark:text-gray-400" />
                              </button>
                </div>
      </div>

      {/* Desktop Filter Pills */}
      {showFilterPills && (
        <div className="hidden md:block mx-auto max-w-7xl px-0 py-1">
          <div className="flex items-center gap-2 relative">
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setIsSortOpen(!isSortOpen);
                          }}
                          className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap transition-colors"
                        >
                          Sort by: {sortBy === "volume" ? "24hr Volume" : sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : "Closing Soon"}
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
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">Sort by</div>
                  <button
                    onClick={() => handleSortChange("volume")}
                    className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      sortBy === "volume" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    24hr Volume
                  </button>
                  <button
                    onClick={() => handleSortChange("newest")}
                    className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      sortBy === "newest" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => handleSortChange("oldest")}
                    className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      sortBy === "oldest" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Oldest
                  </button>
                  <button
                    onClick={() => handleSortChange("closing")}
                    className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      sortBy === "closing" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
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
            onChange={(e) => setSearchQuery(e.target.value)}
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
        <button className="size-9 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 grid place-items-center transition-colors" aria-label="Bookmark">
          <Bookmark className="size-4 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Filter Pills */}
      {showFilterPills && (
        <div ref={sortRef} className="md:hidden mx-auto max-w-[680px] px-3 py-1 relative">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            setIsSortOpen(!isSortOpen);
          }}
          className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap transition-colors"
        >
          Sort by: {sortBy === "volume" ? "24hr Volume" : sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : "Closing Soon"}
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
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">Sort by</div>
              <button
                onClick={() => handleSortChange("volume")}
                className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  sortBy === "volume" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                24hr Volume
              </button>
              <button
                onClick={() => handleSortChange("newest")}
                className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  sortBy === "newest" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => handleSortChange("oldest")}
                className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  sortBy === "oldest" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                Oldest
              </button>
              <button
                onClick={() => handleSortChange("closing")}
                className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  sortBy === "closing" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
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
      <main className="mx-auto max-w-7xl px-0 py-1 md:py-4 pb-20 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredMarkets.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No markets found</p>
          </div>
        ) : (
                        filteredMarkets.map((market) => (
                          <MarketCard
                            key={market.id}
                            market={market}
                            onYesClick={(marketId, outcomeIndex) =>
                              handleMarketAction("Yes", marketId, outcomeIndex)
                            }
                            onNoClick={(marketId, outcomeIndex) =>
                              handleMarketAction("No", marketId, outcomeIndex)
                            }
                          />
                        ))
          )}
        </div>
      </main>

      {/* Bottom Navigation - Hidden on desktop */}
      <div className="lg:hidden">
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Side Panel */}
      <SidePanel 
        isOpen={isSidePanelOpen} 
        onClose={() => setIsSidePanelOpen(false)} 
      />

      {/* Sign Up Modal */}
      <SignUpModal 
        isOpen={isSignUpModalOpen} 
        onClose={closeSignUpModal}
        mode={signUpModalMode}
      />

              {/* Dev Network Badge */}
              {process.env.NODE_ENV !== "production" && (
                <div className="fixed bottom-3 right-3 text-xs px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800/80 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700">
                  Network: Localhost 8545
                </div>
              )}
    </div>
  );
}