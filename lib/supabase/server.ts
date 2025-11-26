import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn(
    "SUPABASE_URL is not set. Database calls will fail until configured."
  );
}

if (!serviceKey) {
  console.warn(
    "SUPABASE_SERVICE_ROLE_KEY is missing. Server-side Supabase calls require this key."
  );
}

/**
 * Creates a Supabase client for server-side operations
 * This is a wrapper around the supabaseAdmin client for compatibility
 * with contractor API routes
 */
export function createClient() {
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase credentials not configured");
  }

  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
    },
  });
}
