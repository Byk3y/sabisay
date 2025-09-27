/**
 * Supabase client for browser/client-side operations
 *
 * This module provides a Supabase client configured for browser usage.
 * It uses the anonymous key and is safe to use in client-side code.
 *
 * @example
 * ```typescript
 * import { supabaseClient } from '@/lib/supabase-client';
 *
 * // Get user session
 * const { data: { session } } = await supabaseClient.auth.getSession();
 *
 * // Query data
 * const { data, error } = await supabaseClient
 *   .from('markets')
 *   .select('*');
 * ```
 */

import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Validate required environment variables
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

/**
 * Supabase client for browser/client-side operations
 *
 * This client is configured with the anonymous key and is safe to use
 * in client-side code. It provides read access to public data and
 * user authentication capabilities.
 */
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage for browser usage
    persistSession: true,
    // Auto refresh session
    autoRefreshToken: true,
    // Detect session from URL (for magic links, etc.)
    detectSessionInUrl: true,
  },
});
