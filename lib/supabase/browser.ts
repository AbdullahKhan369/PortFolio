"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "./env";

let client: SupabaseClient | null = null;

/** Browser Supabase client (one instance per tab). Uses the signed-in admin's session cookies. */
export function createClient(): SupabaseClient {
  if (client) return client;
  const { url, anonKey } = requireSupabaseEnv();
  client = createBrowserClient(url, anonKey);
  return client;
}

export const supabaseBrowser = createClient;
