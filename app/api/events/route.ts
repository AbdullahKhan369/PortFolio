import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { eventSchema, trimMeta } from "@/lib/api/schemas";
import { clientKey, fail, ok, readJson, sameOrigin } from "@/lib/api/respond";
import { getRequestDb } from "@/lib/api/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/events  (contract section 8)
 * body: { name, path?, meta? } -> { ok: true }
 * Anonymous, insert-only. No IP, no cookies and no user id are stored.
 */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return fail(403, "This request did not come from the website.");

  const limited = rateLimit(clientKey(req, "evt"), { limit: 60, windowMs: 60_000 });
  if (!limited.ok) {
    return fail(429, "Too many events. Slow down.", { "Retry-After": String(limited.retryAfter) });
  }

  const raw = await readJson(req, 2_000);
  if (raw === "too-large") return fail(413, "Event is too large.");
  if (raw === null) return fail(400, "Event body must be JSON.");

  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) return fail(400, parsed.error.issues[0]?.message || "Invalid event.");

  const { name, path, meta } = parsed.data;
  const db = await getRequestDb();
  const { error } = await db.from("events").insert({ name, path: path || null, meta: trimMeta(meta) });
  if (error) {
    console.error("[events] insert failed:", error.code, error.message);
    return fail(500, "Event could not be saved.");
  }
  return ok();
}
