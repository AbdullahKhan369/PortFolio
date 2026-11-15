// Admin-editable overrides for every UI string (table site_copy, key "namespace.key").
// Server only. Cached with tag content:site_copy. If the table does not exist yet the site just uses the built-in text.
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import { CONTENT_REVALIDATE_SECONDS, contentTag } from "./meta";

export type CopyOverrides = Record<string, { en: string; ur: string }>;

const load = unstable_cache(
  async (): Promise<CopyOverrides> => {
    const sb = createPublicClient();
    if (!sb) throw new Error("Supabase is not configured");
    const { data, error } = await sb.from("site_copy").select("key, value_en, value_ur");
    if (error) throw new Error(`[content:site_copy] ${error.message}`);
    const out: CopyOverrides = {};
    for (const row of (data ?? []) as { key: string; value_en: string | null; value_ur: string | null }[]) {
      out[row.key] = { en: row.value_en ?? "", ur: row.value_ur ?? "" };
    }
    return out;
  },
  ["site_copy", "all"],
  { tags: [contentTag("site_copy")], revalidate: CONTENT_REVALIDATE_SECONDS },
);

export async function getCopyOverrides(): Promise<CopyOverrides> {
  try {
    return await load();
  } catch {
    return {};
  }
}
