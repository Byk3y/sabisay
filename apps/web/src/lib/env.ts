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
  // Environment variables loaded
}
