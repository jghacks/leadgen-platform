import { createBrowserClient } from "@supabase/ssr";

// Browser client (for use in client components)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Server client — import this only in server components/API routes
// Use: import { createServerSupabaseClient } from "@/lib/supabase-server"
export { createServerSupabaseClient } from "@/lib/supabase-server";

// Admin client with service role (for server-side privileged operations)
export function createAdminClient() {
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
