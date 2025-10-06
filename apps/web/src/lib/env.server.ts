/**
 * Server-only environment variables
 *
 * This module provides validated server-only environment variables.
 * It MUST NOT be imported on the client side for security.
 */

import { z } from 'zod';

// Safety guard: prevent client-side access
if (typeof window !== 'undefined') {
  throw new Error(
    'env.server.ts imported on the client — this is not allowed.'
  );
}

const ServerSchema = z.object({
  NODE_ENV: z.string().default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  MAGIC_SECRET_KEY: z.string().min(1),
  IRON_SESSION_PASSWORD: z.string().min(32),
  PRIVATE_KEY: z.string().regex(/^0x[0-9a-fA-F]{64}$/),
  ALCHEMY_AMOY_RPC_URL: z.string().url().optional(),
  PINATA_API_KEY: z.string().optional(),
  PINATA_SECRET_KEY: z.string().optional(),
  BICONOMY_API_KEY: z.string().optional(),
  TREASURY_ADDRESS: z
    .string()
    .regex(/^0x[0-9a-fA-F]{40}$/)
    .optional(),
  USDC_ADDRESS: z
    .string()
    .regex(/^0x[0-9a-fA-F]{40}$/)
    .optional(),
});

export const serverEnv = ServerSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  MAGIC_SECRET_KEY: process.env.MAGIC_SECRET_KEY,
  IRON_SESSION_PASSWORD: process.env.IRON_SESSION_PASSWORD,
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  ALCHEMY_AMOY_RPC_URL: process.env.ALCHEMY_AMOY_RPC_URL,
  PINATA_API_KEY: process.env.PINATA_API_KEY,
  PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY,
  BICONOMY_API_KEY: process.env.BICONOMY_API_KEY,
  TREASURY_ADDRESS: process.env.TREASURY_ADDRESS,
  USDC_ADDRESS: process.env.USDC_ADDRESS,
});

// Type export for better IDE support
export type ServerEnv = typeof serverEnv;



