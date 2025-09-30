/**
 * Environment variable validation and type safety
 *
 * This module provides runtime validation for environment variables
 * and exports typed objects for use throughout the application.
 *
 * IMPORTANT: This file now delegates to separate server/client modules
 * to ensure proper security boundaries.
 */

import { clientEnv } from './env.client';

// Combined environment object (for backward compatibility)
// Only includes client-safe variables to prevent accidental server secret exposure
export const env = {
  ...clientEnv,
} as const;

// Re-export client environment for specific use cases
export { clientEnv } from './env.client';

// Type definitions for better IDE support
export type { ClientEnv } from './env.client';
export type Env = typeof env;

// Debug environment variables in development (client-safe only)
if (process.env.NODE_ENV === 'development') {
  console.log('=== ENV DEBUG: Client environment variables loaded ===');
  console.log('NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY:', env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY ? 'Set' : 'Not set');
  console.log('NEXT_PUBLIC_CHAIN_ID:', env.NEXT_PUBLIC_CHAIN_ID);
  console.log('NEXT_PUBLIC_RPC_URL:', env.NEXT_PUBLIC_RPC_URL);
  console.log('===============================================');
}
