import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv, requireSupabaseEnv } from "./env";

/**
 * Server Supabase client bound to the visitor's cookies (admin pages, route handlers, server actions).
 * Acts as the signed-in user, so RLS applies.
 */
export async function createClient(): Promise<SupabaseClient> {
  const { url, anonKey } = requireSupabaseEnv();
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: cookies are read-only there.
          // The middleware refreshes the session, so ignoring this is safe.
        }
      },
    },
  });
}

/**
 * Cookie-less anon client for PUBLIC content reads (lib/content). Safe inside unstable_cache
 * because it touches no request data. RLS limits it to is_visible rows.
 * Returns null when env vars are missing so callers can use the fallback content.
 */
export function createPublicClient(): SupabaseClient | null {
  const env = getSupabaseEnv();
  if (!env) return null;
  return createSupabaseClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      // Do not let a slow database hang page rendering.
      fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(6000) }),
    },
  });
}
