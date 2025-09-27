/**
 * Environment variable validation and type safety
 *
 * This module provides runtime validation for environment variables
 * and exports a typed `env` object for use throughout the application.
 *
 * Server-only variables are validated on import and will throw clear
 * error messages if missing. Public variables have sensible defaults.
 */

// Helper function for required environment variables
function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
        `Please check your .env.local file or environment configuration.`
    );
  }
  return value;
}

// Helper function for optional environment variables with fallback
function getEnv(name: string, fallback: string = ''): string {
  return process.env[name] || fallback;
}

// Server-only environment variables (required unless noted)
// Only validate these on the server side to avoid client-side errors
const serverEnv = {
  // Magic Link authentication
  MAGIC_SECRET_KEY: typeof window === 'undefined' ? requireEnvVar('MAGIC_SECRET_KEY') : '',
  MAGIC_PUBLISHABLE_KEY: typeof window === 'undefined' ? requireEnvVar('MAGIC_PUBLISHABLE_KEY') : '',

  // Session management
  IRON_SESSION_PASSWORD: typeof window === 'undefined' ? requireEnvVar('IRON_SESSION_PASSWORD') : '',

  // Supabase configuration
  SUPABASE_URL: typeof window === 'undefined' ? requireEnvVar('SUPABASE_URL') : '',
  SUPABASE_SERVICE_ROLE_KEY: typeof window === 'undefined' ? requireEnvVar('SUPABASE_SERVICE_ROLE_KEY') : '',

  // Biconomy for gasless transactions
  BICONOMY_API_KEY: typeof window === 'undefined' ? requireEnvVar('BICONOMY_API_KEY') : '',

  // RPC configuration
  ALCHEMY_AMOY_RPC_URL: typeof window === 'undefined' ? requireEnvVar('ALCHEMY_AMOY_RPC_URL') : '',

  // Optional server variables (only required for specific operations)
  TREASURY_ADDRESS: getEnv('TREASURY_ADDRESS'),
  PRIVATE_KEY: getEnv('PRIVATE_KEY'),
  USDC_ADDRESS: getEnv('USDC_ADDRESS'),
} as const;

// Public environment variables (exposed to browser)
const publicEnv = {
  // Chain configuration
  NEXT_PUBLIC_CHAIN_ID: getEnv('NEXT_PUBLIC_CHAIN_ID', '80002'),
  NEXT_PUBLIC_RPC_URL: getEnv(
    'NEXT_PUBLIC_RPC_URL',
    getEnv('ALCHEMY_AMOY_RPC_URL', 'https://rpc-amoy.polygon.technology')
  ),

  // WalletConnect configuration
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: getEnv(
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID'
  ),

  // Contract addresses
  NEXT_PUBLIC_USDC_ADDRESS: getEnv('NEXT_PUBLIC_USDC_ADDRESS'),
  NEXT_PUBLIC_FACTORY_ADDRESS: getEnv('NEXT_PUBLIC_FACTORY_ADDRESS'),

  // Supabase configuration (public)
  NEXT_PUBLIC_SUPABASE_URL: getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),

  // Magic configuration (public)
  NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY: getEnv('NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY'),
} as const;

// Combined environment object
export const env = {
  ...serverEnv,
  ...publicEnv,
} as const;

// Type definitions for better IDE support
export type ServerEnv = typeof serverEnv;
export type PublicEnv = typeof publicEnv;
export type Env = typeof env;

// Helper function for one-off environment checks
export function requireEnv(name: string): string {
  return requireEnvVar(name);
}

// Validation function to check all required variables at startup
export function validateEnv(): void {
  try {
    // This will throw if any required variables are missing
    const _ = env;
    console.log('✅ Environment variables validated successfully');
  } catch (error) {
    console.error('❌ Environment validation failed:');
    console.error(error);
    process.exit(1);
  }
}

// Auto-validate on import in production
if (process.env.NODE_ENV === 'production') {
  validateEnv();
}
