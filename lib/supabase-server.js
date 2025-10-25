import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Create a Supabase client for server-side operations
 * Uses service role key to bypass RLS when needed
 *
 * @param {Object} cookieStore - Next.js cookies() object
 * @returns {Object} Supabase client instance
 */
export function createServerClient(cookieStore) {
  // For server-side API routes, we use the admin client
  // This bypasses RLS but allows us to set company_id for policies
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export default createServerClient;
