import { createClient } from "@supabase/supabase-js";

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

export const supabaseAdmin =
  supabaseUrl && serviceKey
    ? createClient(supabaseUrl, serviceKey, {
        auth: {
          persistSession: false,
        },
      })
    : null;
