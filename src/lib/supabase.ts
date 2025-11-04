import { createClient } from "@supabase/supabase-js";

// Ensure these environment variables are defined in your .env file
// For client-side usage, they must be prefixed with NEXT_PUBLIC_
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined.",
  );
}

// Create a single Supabase client for use throughout the app (client-side capable)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For server-side operations that require elevated privileges (e.g., in API routes)
// This client uses the service role key and should NEVER be exposed to the client-side.
export const createAdminClient = () => {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase service role key. SUPABASE_SERVICE_ROLE_KEY must be defined for admin client.",
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false, // Admin client typically doesn't need to persist sessions
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};
