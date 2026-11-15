import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * The ONLY place S4 touches the Supabase client factories owned by S1.
 * The contract freezes the file names (lib/supabase/{server,service}.ts) but not
 * the export names, so this adapter assumes:
 *   server.ts  -> export (async) function createClient()
 *   service.ts -> export function createServiceClient()
 * If S1 named them differently, fix the two import lines above; nothing else changes.
 */
export type Db = SupabaseClient;

/** Request-scoped client (anon role unless an admin session cookie is present). RLS applies. */
export async function getRequestDb(): Promise<Db> {
  return (await createServerClient()) as unknown as Db;
}

/** Service-role client. Server only. Used for read-only flood checks. */
export async function getServiceDb(): Promise<Db> {
  return (await createServiceClient()) as unknown as Db;
}
