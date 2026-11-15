import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { inquirySchema } from "@/lib/api/schemas";
import { clientKey, fail, ok, readJson, sameOrigin } from "@/lib/api/respond";
import { getRequestDb } from "@/lib/api/db";
import { isFlooded } from "@/lib/api/flood";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/inquiries  (contract section 8)
 * body: { name?, contact, message, niche?, source, lang, website? (honeypot) }
 * -> { ok: true } | { ok: false, error }   HTTP 400 / 429 (and 403 / 413 / 500 for the edge cases below)
 */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return fail(403, "This request did not come from the website. Reload the page and try again.");

  // 5 per 10 minutes per visitor, 2 per minute burst limit.
  const burst = rateLimit(clientKey(req, "inq-burst"), { limit: 2, windowMs: 60_000 });
  const slow = rateLimit(clientKey(req, "inq"), { limit: 5, windowMs: 10 * 60_000 });
  if (!burst.ok || !slow.ok) {
    const wait = Math.max(burst.retryAfter, slow.retryAfter);
    return fail(429, `Too many messages in a short time. Wait ${wait} seconds and send again.`, {
      "Retry-After": String(wait),
    });
  }

  const raw = await readJson(req, 8_000);
  if (raw === "too-large") return fail(413, "Your message is too long. Shorten it and send again.");
  if (raw === null) return fail(400, "The form data could not be read. Reload the page and try again.");

  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return fail(400, first?.message || "Check the form: contact and message are required.");
  }
  const data = parsed.data;

  // Honeypot: a bot filled the hidden field. Pretend it worked, store nothing.
  if (data.website && data.website.trim() !== "") return ok();

  if (await isFlooded(data.contact)) {
    return fail(429, "You already sent a few messages. I will reply soon, so please wait a little before sending more.", {
      "Retry-After": "600",
    });
  }

  const db = await getRequestDb();
  const { error } = await db.from("inquiries").insert({
    name: data.name || null,
    contact: data.contact,
    message: data.message,
    niche: data.niche || null,
    source: data.source,
    lang: data.lang,
    status: "new",
  });

  if (error) {
    console.error("[inquiries] insert failed:", error.code, error.message);
    return fail(500, "Your message could not be saved. Send it on WhatsApp instead, or try again in a minute.");
  }
  return ok();
}
