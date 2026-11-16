import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { CONTENT_TAGS, TAG_PATTERN } from "@/lib/content/meta";
import { getAdmin } from "@/lib/supabase/guard";

export const dynamic = "force-dynamic";

const body = z
  .object({
    tag: z.string().regex(TAG_PATTERN).optional(),
    tags: z.array(z.string().regex(TAG_PATTERN)).max(40).optional(),
    all: z.boolean().optional(),
  })
  .strict();

const json = (data: object, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

/** POST /api/revalidate  { tag } | { tags: [...] } | { all: true }  (admins only) */
export async function POST(req: NextRequest) {
  // Same-origin only: blocks cross-site form posts that ride on the admin's cookies.
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) return json({ ok: false, error: "Forbidden" }, 403);

  let admin;
  try {
    admin = await getAdmin();
  } catch {
    return json({ ok: false, error: "Server is not configured" }, 500);
  }
  if (!admin) return json({ ok: false, error: "Unauthorized" }, 401);

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ ok: false, error: "Invalid request" }, 400);
  const { tag, tags, all } = parsed.data;

  const list = all ? CONTENT_TAGS : [...(tags ?? []), ...(tag ? [tag] : [])];
  if (list.length === 0) return json({ ok: false, error: "Nothing to revalidate" }, 400);

  for (const t of new Set(list)) revalidateTag(t);
if (all) {
  revalidatePath("/[lang]", "layout");
  revalidatePath("/", "layout");
}  return json({ ok: true, revalidated: list.length });
}
