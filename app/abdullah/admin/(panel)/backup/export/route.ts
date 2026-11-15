import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/guard";
import { getRequestDb } from "@/lib/api/db";
import { BACKUP_APP, BACKUP_TABLES, BACKUP_VERSION } from "../tables";

export const dynamic = "force-dynamic";

/** GET: downloads every content table as one JSON file. `?inquiries=1` adds the inquiries inbox. */
export async function GET(req: NextRequest) {
  await requireAdmin();
  const withInquiries = req.nextUrl.searchParams.get("inquiries") === "1";
  const db = await getRequestDb();

  const tables: Record<string, unknown[]> = {};
  const names: string[] = BACKUP_TABLES.map((t) => t.name);
  if (withInquiries) names.push("inquiries");

  for (const name of names) {
    // Pages of 1000 so a large table is never silently cut off by the API row limit.
    const rows: unknown[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await db.from(name).select("*").range(from, from + 999);
      if (error) {
        if (name === "site_copy") break; // optional table: the Site text migration may not have run yet
        return new Response(`Export failed on table "${name}". Check you are logged in as admin and try again.`, { status: 500 });
      }
      rows.push(...(data ?? []));
      if (!data || data.length < 1000) break;
    }
    tables[name] = rows;
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const body = JSON.stringify({ app: BACKUP_APP, version: BACKUP_VERSION, exported_at: new Date().toISOString(), tables }, null, 2);
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="prismarc-backup-${stamp}.json"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
