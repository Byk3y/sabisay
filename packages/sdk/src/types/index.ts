// Market types
export interface Market {
  id: string;
  question: string;
  description?: string;
  category: 'politics' | 'economy' | 'entertainment' | 'sports' | 'crypto';
  endDate: Date;
  resolutionDate: Date;
  status: 'open' | 'pending-resolution' | 'dispute-window' | 'finalized';
  yesOdds: number;
  noOdds: number;
  volume: number;
  liquidity: number;
  creator: string;
  resolver: string;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Position types
export interface Position {
  marketId: string;
  side: 'yes' | 'no';
  amount: number;
  shares: number;
  averagePrice: number;
  createdAt: Date;
}

// User types
export interface User {
  address: string;
  balance: number;
  positions: Position[];
  totalPnl: number;
}

// Trade types
export interface Trade {
  id: string;
  marketId: string;
  user: string;
  side: 'yes' | 'no';
  amount: number;
  shares: number;
  price: number;
  timestamp: Date;
  txHash: string;
}

// Contract types
export interface MarketConfig {
  factoryAddress: string;
  usdcAddress: string;
  chainId: number;
  rpcUrl: string;
}

// Hook return types
export interface UseMarketsReturn {
  markets: Market[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseTradeReturn {
  trade: (params: TradeParams) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export interface TradeParams {
  marketId: string;
  side: 'yes' | 'no';
  amount: number;
  slippage?: number;
  deadline?: number;
}
