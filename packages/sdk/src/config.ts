// SDK Configuration for PakoMarket
import localAddrs from "../../../contracts/addresses/local.json"; // dev only

export const SDK_CONFIG = {
  // Local Anvil Chain
  local: {
    chainId: 31337,
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545",
    name: "Localhost 8545",
    currency: "ETH",
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
  
  // Default Configuration
  defaults: {
    slippage: 1, // 1% default slippage
    deadline: 20 * 60, // 20 minutes
    minStake: 1, // 1 USDC minimum
  },
} as const;

export type SDKConfig = typeof SDK_CONFIG;
