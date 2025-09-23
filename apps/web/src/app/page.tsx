"use client";

import { useState, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, Bookmark, ChevronDown } from "lucide-react";
import { TopNav } from "@/components/nav/TopNav";
import { CategoryTabs } from "@/components/nav/CategoryTabs";
import { MarketCard } from "@/components/market/MarketCard";
import { BottomNav } from "@/components/nav/BottomNav";
import { SidePanel } from "@/components/nav/SidePanel";
import { mockMarkets, type Category } from "@/lib/mock";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<Category>("Trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"home" | "search" | "breaking" | "more">("home");
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"volume" | "newest" | "oldest" | "closing">("volume");
  const [showFilterPills, setShowFilterPills] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen bg-finance-bg text-finance-text-primary">
      {/* Top Navigation */}
      <TopNav />

      {/* Category Tabs */}
      <CategoryTabs onCategoryChange={setActiveCategory} />

      {/* Desktop Search Bar */}
        <div className="hidden md:block mx-auto max-w-7xl px-3 md:px-4 py-2">
          <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 rounded-md bg-finance-card px-3 py-2 w-96">
                        <Search className="size-4 text-finance-text-disabled" />
                        <input
                          type="text"
                          placeholder="Search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-transparent text-sm placeholder:text-finance-text-disabled focus:outline-none text-finance-text-primary"
                        />
                      </div>
                      <button 
                        onClick={() => setShowFilterPills(!showFilterPills)}
                        className="size-7 rounded-md bg-finance-card hover:bg-finance-border grid place-items-center" 
                        aria-label="Filter"
                      >
                        <SlidersHorizontal className="size-4 text-finance-text-secondary" />
                      </button>
                      <button className="size-7 rounded-md bg-finance-card hover:bg-finance-border grid place-items-center" aria-label="Bookmark">
                        <Bookmark className="size-4 text-finance-text-secondary" />
                      </button>
        </div>
      </div>

      {/* Desktop Filter Pills */}
      {showFilterPills && (
        <div className="hidden md:block mx-auto max-w-7xl px-3 md:px-4 py-1">
          <div className="flex items-center gap-2 relative">
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setIsSortOpen(!isSortOpen);
                          }}
                          className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-finance-card hover:bg-finance-border text-xs text-finance-text-secondary whitespace-nowrap"
                        >
                          Sort by: {sortBy === "volume" ? "24hr Volume" : sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : "Closing Soon"}
                          <ChevronDown className="size-3" />
                        </button>
                        
                        <button className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-finance-card hover:bg-finance-border text-xs text-finance-text-secondary whitespace-nowrap">
                          Frequency: All
                          <ChevronDown className="size-3" />
                        </button>
                        
                        <button className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-finance-card hover:bg-finance-border text-xs text-finance-text-secondary whitespace-nowrap">
                          Status: Active
                          <ChevronDown className="size-3" />
                        </button>

            {/* Desktop Sort Dropdown */}
            {isSortOpen && (
              <div className="absolute top-full left-0 mt-2 bg-finance-card border border-finance-border rounded-lg shadow-lg z-50 min-w-[200px]">
                <div className="p-2">
                  <div className="text-xs text-finance-text-disabled mb-2 px-2">Sort by</div>
                  <button
                    onClick={() => handleSortChange("volume")}
                    className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-finance-border ${
                      sortBy === "volume" ? "text-finance-accent" : "text-finance-text-secondary"
                    }`}
                  >
                    24hr Volume
                  </button>
                  <button
                    onClick={() => handleSortChange("newest")}
                    className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-finance-border ${
                      sortBy === "newest" ? "text-finance-accent" : "text-finance-text-secondary"
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => handleSortChange("oldest")}
                    className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-finance-border ${
                      sortBy === "oldest" ? "text-finance-accent" : "text-finance-text-secondary"
                    }`}
                  >
                    Oldest
                  </button>
                  <button
                    onClick={() => handleSortChange("closing")}
                    className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-finance-border ${
                      sortBy === "closing" ? "text-finance-accent" : "text-finance-text-secondary"
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
        <div className="flex-1 flex items-center gap-2 rounded-md bg-finance-card px-3 py-2">
          <Search className="size-4 text-finance-text-disabled" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm placeholder:text-finance-text-disabled focus:outline-none text-finance-text-primary"
          />
        </div>
        <button
          onClick={() => setShowFilterPills(!showFilterPills)}
          className="size-9 rounded-md bg-finance-card hover:bg-finance-border grid place-items-center"
          aria-label="Toggle Filters"
        >
          <SlidersHorizontal className="size-4 text-finance-text-secondary" />
        </button>
        <button className="size-9 rounded-md bg-finance-card hover:bg-finance-border grid place-items-center" aria-label="Bookmark">
          <Bookmark className="size-4 text-finance-text-secondary" />
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
          className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-finance-card hover:bg-finance-border text-xs text-finance-text-secondary whitespace-nowrap"
        >
          Sort by: {sortBy === "volume" ? "24hr Volume" : sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : "Closing Soon"}
          <ChevronDown className="size-3" />
        </button>
        
        <button className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-finance-card hover:bg-finance-border text-xs text-finance-text-secondary whitespace-nowrap">
          Frequency: All
          <ChevronDown className="size-3" />
        </button>
        
        <button className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-finance-card hover:bg-finance-border text-xs text-finance-text-secondary whitespace-nowrap">
          Status: Active
          <ChevronDown className="size-3" />
        </button>

        {/* Sort Dropdown */}
        {isSortOpen && (
          <div className="absolute top-full left-0 mt-2 bg-finance-card border border-finance-border rounded-lg shadow-lg z-50 min-w-[200px]">
            <div className="p-2">
              <div className="text-xs text-finance-text-disabled mb-2 px-2">Sort by</div>
              <button
                onClick={() => handleSortChange("volume")}
                className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-finance-border ${
                  sortBy === "volume" ? "text-finance-accent" : "text-finance-text-secondary"
                }`}
              >
                24hr Volume
              </button>
              <button
                onClick={() => handleSortChange("newest")}
                className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-finance-border ${
                  sortBy === "newest" ? "text-finance-accent" : "text-finance-text-secondary"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => handleSortChange("oldest")}
                className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-finance-border ${
                  sortBy === "oldest" ? "text-finance-accent" : "text-finance-text-secondary"
                }`}
              >
                Oldest
              </button>
              <button
                onClick={() => handleSortChange("closing")}
                className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-finance-border ${
                  sortBy === "closing" ? "text-finance-accent" : "text-finance-text-secondary"
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
      <main className="mx-auto max-w-7xl px-3 md:px-4 py-1 md:py-4 pb-20 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredMarkets.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-finance-text-disabled">No markets found</p>
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
    </div>
  );
}