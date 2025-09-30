/**
 * Client-safe environment variables
 * 
 * This module provides validated client-safe environment variables.
 * Only variables prefixed with NEXT_PUBLIC_ are available here.
 */

import { z } from 'zod';

const ClientSchema = z.object({
  NODE_ENV: z.string().default('development'),
  NEXT_PUBLIC_CHAIN_ID: z.string().default('80002'),
  NEXT_PUBLIC_RPC_URL: z.string().url(),
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_USDC_ADDRESS: z.string().regex(/^0x[0-9a-fA-F]{40}$/).optional(),
  NEXT_PUBLIC_FACTORY_ADDRESS: z.string().regex(/^0x[0-9a-fA-F]{40}$/).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_IPFS_GATEWAY_URL: z.string().url().optional(),
});

export const clientEnv = ClientSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
  NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS,
  NEXT_PUBLIC_FACTORY_ADDRESS: process.env.NEXT_PUBLIC_FACTORY_ADDRESS,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY,
  NEXT_PUBLIC_IPFS_GATEWAY_URL: process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL,
});

// Type export for better IDE support
export type ClientEnv = typeof clientEnv;
