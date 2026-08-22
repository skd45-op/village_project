import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses Row Level Security. SERVER-ONLY.
// Never import this into a Client Component. Used for privileged admin
// operations (e.g. creating auth users on membership approval).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
