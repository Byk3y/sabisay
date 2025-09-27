/**
 * Market-related TypeScript type definitions
 * Extracted from page.tsx for better organization and reusability
 */

// Re-export existing types from mock.ts for consistency
export type { RawMarket, MarketOutcome } from '@/lib/mock';

// New discriminated union types for different market presentations
export type UiStyle = "default" | "binary" | "chance"; // "chance" deprecated

export interface BaseMarket {
  id: string;
  question: string;
  poolUsd: number;
  imageUrl?: string;
  closesAt?: string;
  outcomes?: Array<{ label: string; oddsPct: number }>;
}

export type MarketItem =
  | ({
      kind: "market";
      uiStyle?: UiStyle; // default or chance
    } & BaseMarket)
  | ({
      kind: "group";
      groupId: string;
      title: string;
      members: Array<{
        label: string;
        marketId: string; // points to a MarketItem with kind:"market"
      }>;
    });

export function isGroup(item: MarketItem): item is Extract<MarketItem, { kind: "group" }> {
  return item.kind === "group";
}

/** @deprecated Use isBinaryMarketView */
export function isChanceMarket(item: MarketItem): item is Extract<MarketItem, { kind: "market"; uiStyle: "chance" }> {
  return item.kind === "market" && item.uiStyle === "chance";
}

// Define Category type locally to avoid import issues
export type Category = "Trending" | "Politics" | "Breaking" | "New" | "Sports" | "Crypto" | "Earnings" | "Geopolitics" | "Tech" | "Culture" | "World" | "Economy" | "Naija Picks";

/**
 * Transformed market data structure used in the market details page
 * This is the processed version of the raw market data
 */
export interface Market {
  id: string;
  title: string;
  volume: number;
  endDate: Date;
  outcomes: Outcome[];
  relatedMarkets: RelatedMarket[];
  uiStyle?: UiStyle; // Add this field to preserve uiStyle
}

/**
 * Market outcome with probability and pricing information
 */
export interface Outcome {
  name: string;
  probability: number;
  volume: number;
  price: {
    yes: number;
    no: number;
  };
}

/**
 * Related market for display in market details
 */
export interface RelatedMarket {
  id: string;
  title: string;
  probability: number;
  volume: number;
}

/**
 * Trading-related types
 */
export type TradeType = "buy" | "sell";
export type OrderType = "market" | "limit";

/**
 * Trade data structure for executing trades
 */
export interface TradeData {
  amount: string;
  type: TradeType;
  candidate: number;
  outcome: number;
  orderType: OrderType;
  limitPrice?: string;
  shares?: string;
  expiration?: string;
}

/**
 * Trading state interface for the useTradingState hook
 */
export interface TradingState {
  tradeAmount: string;
  tradeType: TradeType;
  selectedCandidate: number;
  selectedOutcome: number;
  orderType: OrderType;
  limitPrice: string;
  shares: string;
  expirationEnabled: boolean;
  expirationDropdownOpen: boolean;
  selectedExpiration: string;
  isMobileSidebarOpen: boolean;
}

/**
 * Market UI state interface for the useMarketUI hook
 */
export interface MarketUIState {
  activeTab: string;
  activeCategory: Category;
  isInputFocused: boolean;
  isMobile: boolean;
}

/**
 * Market data state interface for the useMarketData hook
 */
export interface MarketDataState {
  market: Market | null;
  isLoading: boolean;
}

/**
 * Chart-related types
 */
export interface ChartData {
  outcomes: Outcome[];
  timePeriod: string;
}

/**
 * Component prop interfaces
 */
export interface MarketHeaderProps {
  market: Market;
  onShare?: () => void;
  onBookmark?: () => void;
  isMobile?: boolean;
  isChanceMarket?: boolean;
}

export interface MarketChartProps {
  outcomes: Outcome[];
  onTimePeriodChange?: (period: string) => void;
}

export interface TradingSidebarProps {
  market: Market;
  selectedOutcome: number;
  selectedCandidate: number;
  tradeAmount: string;
  tradeType: TradeType;
  orderType: OrderType;
  limitPrice: string;
  shares: string;
  expirationEnabled: boolean;
  selectedExpiration: string;
  isMobile?: boolean;
  isMobileSidebarOpen?: boolean;
  isChanceMarket?: boolean;
  onTrade: (tradeData: TradeData) => void;
  onOutcomeSelect: (outcomeIndex: number, candidateIndex: number) => void;
  onCandidateSelect: (candidateIndex: number) => void;
  onAmountChange: (amount: string) => void;
  onOrderTypeChange: (orderType: OrderType) => void;
  onTradeTypeChange: (tradeType: TradeType) => void;
  onLimitPriceChange: (price: string) => void;
  onSharesChange: (shares: string) => void;
  onExpirationToggle: (enabled: boolean) => void;
  onExpirationSelect: (expiration: string) => void;
  onMobileSidebarClose?: () => void;
}

export interface OutcomeListProps {
  outcomes: Outcome[];
  selectedOutcome: number;
  selectedCandidate: number;
  onOutcomeSelect: (outcomeIndex: number, candidateIndex: number) => void;
  isMobile?: boolean;
  onMobileSidebarOpen?: () => void;
}

export interface RulesSectionProps {
  rules: string;
  onShowMore?: () => void;
}

/**
 * Utility function types
 */
export type FormatTradeAmount = (amount: string) => string;
export type CalculatePotentialWin = (amount: number, price: number) => number;
export type ValidateTradeInput = (input: string) => boolean;
export type CalculateTotal = (price: number, shares: number) => number;
export type FormatCurrency = (amount: number) => string;
export type FormatDate = (date: Date) => string;
export type FormatPercentage = (value: number) => string;

/**
 * Hook return types
 */
export interface UseMarketDataReturn extends MarketDataState {
  setMarket: (market: Market | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export interface UseTradingStateReturn extends TradingState {
  setTradeAmount: (amount: string) => void;
  setTradeType: (type: TradeType) => void;
  setSelectedCandidate: (candidate: number) => void;
  setSelectedOutcome: (outcome: number) => void;
  setOrderType: (orderType: OrderType) => void;
  setLimitPrice: (price: string) => void;
  setShares: (shares: string) => void;
  setExpirationEnabled: (enabled: boolean) => void;
  setExpirationDropdownOpen: (open: boolean) => void;
  setSelectedExpiration: (expiration: string) => void;
  setIsMobileSidebarOpen: (open: boolean) => void;
  resetTradingState: () => void;
  handleOutcomeAndCandidateSelect: (outcome: number, candidate: number) => void;
}

export interface UseMarketUIReturn extends MarketUIState {
  setActiveTab: (tab: string) => void;
  setActiveCategory: (category: Category) => void;
  setIsInputFocused: (focused: boolean) => void;
}
