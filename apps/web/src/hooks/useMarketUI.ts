/**
 * Custom hook for market UI state management
 * Extracted from page.tsx for better organization and reusability
 */

import { useState } from 'react';
import type { UseMarketUIReturn, Category } from '@/types/market';

/**
 * Hook for managing market UI state
 * @returns Market UI state and operations
 */
export const useMarketUI = (): UseMarketUIReturn => {
  const [activeTab, setActiveTab] = useState("All");
  const [activeCategory, setActiveCategory] = useState<Category>("Trending");
  const [isInputFocused, setIsInputFocused] = useState(false);

  return {
    activeTab,
    activeCategory,
    isInputFocused,
    setActiveTab,
    setActiveCategory,
    setIsInputFocused
  };
};
