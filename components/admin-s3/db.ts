"use client";
// Single place where the S3 admin editors reach Supabase and the revalidate API.
// NOTE: the export name of lib/supabase/browser is not frozen in the contract. We assume `createClient`
// (the usual @supabase/ssr pattern). If S1 named it differently, change only this file.
import { createClient } from "@/lib/supabase/browser";

export function getDb() {
  return createClient();
}

/** Contract section 7: nested editors call POST /api/revalidate with { tag } after saving. */
export async function revalidate(tags: string[]): Promise<void> {
  await Promise.all(
    tags.map((tag) =>
      fetch("/api/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tag }) }).catch(() => undefined),
    ),
  );
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function safeFileName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = slugify(dot > 0 ? name.slice(0, dot) : name) || "file";
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) : "";
  return ext ? `${base}.${ext}` : base;
}
