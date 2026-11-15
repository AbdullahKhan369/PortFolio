import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "./env";

/**
 * Service-role client. BYPASSES RLS. Server only: route handlers and server actions after you have
 * validated the request yourself (for example the inquiries API). Never import from a client component.
 */
export function createServiceClient(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("createServiceClient() must never run in the browser.");
  }
  const { url } = requireSupabaseEnv();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set (server-side only; see .env.example).");
  }
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export const createClient = createServiceClient;
