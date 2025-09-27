/**
 * Supabase admin client for server-side operations
 *
 * This module provides a Supabase client configured for server-side usage.
 * It uses the service role key and bypasses Row Level Security (RLS).
 *
 * ⚠️  SECURITY WARNING: This client has admin privileges and should NEVER
 * be used in client-side code. Only use in API routes, server components,
 * and other server-side contexts.
 *
 * @example
 * ```typescript
 * import { supabaseAdmin } from '@/lib/supabase-server';
 *
 * // Create a user (admin operation)
 * const { data, error } = await supabaseAdmin.auth.admin.createUser({
 *   email: 'user@example.com',
 *   password: 'secure-password'
 * });
 *
 * // Query data with admin privileges (bypasses RLS)
 * const { data, error } = await supabaseAdmin
 *   .from('markets')
 *   .select('*');
 * ```
 */

import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Validate required environment variables
const supabaseUrl = env.SUPABASE_URL;
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

/**
 * Supabase admin client for server-side operations
 *
 * This client is configured with the service role key and bypasses
 * Row Level Security (RLS). It should only be used in server-side
 * contexts such as API routes, server components, and background jobs.
 *
 * ⚠️  NEVER use this client in client-side code as it has admin privileges.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    // Don't persist session on server
    persistSession: false,
    // Auto refresh is not needed for admin operations
    autoRefreshToken: false,
    // Don't detect session from URL on server
    detectSessionInUrl: false,
  },
});
