/**
 * Custom hook for market UI state management
 * Extracted from page.tsx for better organization and reusability
 */

import { useState } from 'react';
import { useIsMobile } from './useIsMobile';
import type { UseMarketUIReturn, Category } from '@/types/market';

/**
 * Hook for managing market UI state
 * @returns Market UI state and operations
 */
export const useMarketUI = (): UseMarketUIReturn => {
  const [activeTab, setActiveTab] = useState('All');
  const [activeCategory, setActiveCategory] = useState<Category>('Trending');
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Mobile detection
  const isMobile = useIsMobile();

  return {
    activeTab,
    activeCategory,
    isInputFocused,
    isMobile,
    setActiveTab,
    setActiveCategory,
    setIsInputFocused,
  };
};
