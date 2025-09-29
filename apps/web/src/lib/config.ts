// PakoMarket Configuration
import { env } from './env';

export const config = {
  // Contract Addresses
  contracts: {
    USDC: env.NEXT_PUBLIC_USDC_ADDRESS || '',
    FACTORY: env.NEXT_PUBLIC_FACTORY_ADDRESS || '',
  },

  // App Configuration
  app: {
    name: 'PakoMarket',
    description: 'Crypto-native prediction markets for Africa',
    version: '0.1.0',
  },

  // Trading Configuration
  trading: {
    minStake: 1, // 1 USDC minimum
    maxSlippage: 5, // 5% max slippage
    defaultSlippage: 1, // 1% default slippage
  },
} as const;

export type Config = typeof config;
