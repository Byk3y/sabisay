// SabiSay Configuration
import localAddrs from "../../../../contracts/addresses/local.json"; // dev only

export const config = {
  // Local Anvil Chain Configuration
  local: {
    chainId: 31337,
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545",
    name: "Localhost 8545",
    currency: "ETH",
    blockExplorer: null,
  },
  
  // Contract Addresses
  contracts: {
    USDC:
      process.env.NEXT_PUBLIC_USDC_ADDRESS ||
      (process.env.NODE_ENV !== "production" ? localAddrs.USDC : ""),
    FACTORY:
      process.env.NEXT_PUBLIC_FACTORY_ADDRESS ||
      (process.env.NODE_ENV !== "production" ? localAddrs.FACTORY ?? "" : ""),
  },
  
  // App Configuration
  app: {
    name: 'SabiSay',
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
