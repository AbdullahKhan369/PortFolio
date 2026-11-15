import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/guard";
import { getRequestDb } from "@/lib/api/db";
import { BACKUP_APP, BACKUP_TABLES, BACKUP_VERSION, MAX_IMPORT_BYTES, MAX_ROWS_PER_TABLE, type ImportSummaryRow } from "../tables";

export const dynamic = "force-dynamic";

const backupSchema = z.object({
  app: z.literal(BACKUP_APP),
  version: z.literal(BACKUP_VERSION),
  exported_at: z.string().optional(),
  tables: z.record(z.array(z.record(z.unknown()))),
});

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * POST (multipart, field "file"): merges a backup into the database.
 * Rows are upserted by id (settings by key). Nothing is ever deleted, so importing cannot
 * remove content you added after the backup was taken. Inquiries and admins are never imported.
 */
export async function POST(req: NextRequest) {
  await requireAdmin();

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    file = f instanceof File ? f : null;
  } catch {
    return json({ ok: false, error: "The upload could not be read. Choose the backup file and try again." }, 400);
  }
  if (!file) return json({ ok: false, error: "Choose a backup file first." }, 400);
  if (file.size > MAX_IMPORT_BYTES) return json({ ok: false, error: "This file is larger than 4 MB. Backups of content are much smaller, so check you picked the right file." }, 413);

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(await file.text());
  } catch {
    return json({ ok: false, error: "This file is not valid JSON. Use a file created by the Download backup button." }, 400);
  }

  const parsed = backupSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return json({ ok: false, error: "This is not a Prism Arc backup, or it is from a different version. Use a file created by the Download backup button." }, 400);
  }

  const db = await getRequestDb();
  const summary: ImportSummaryRow[] = [];
  const touched: string[] = [];

  for (const { name, key } of BACKUP_TABLES) {
    const rows = parsed.data.tables[name];
    if (!rows) {
      summary.push({ table: name, rows: 0, status: "skipped", note: "Not in this backup" });
      continue;
    }
    if (rows.length > MAX_ROWS_PER_TABLE) {
      summary.push({ table: name, rows: rows.length, status: "failed", note: `More than ${MAX_ROWS_PER_TABLE} rows` });
      continue;
    }
    if (rows.some((r) => r[key] === undefined || r[key] === null)) {
      summary.push({ table: name, rows: rows.length, status: "failed", note: `Some rows have no "${key}"` });
      continue;
    }

    let failed: string | null = null;
    for (let i = 0; i < rows.length && !failed; i += 200) {
      const { error } = await db.from(name).upsert(rows.slice(i, i + 200), { onConflict: key });
      if (error) failed = error.message;
    }
    if (failed) {
      summary.push({ table: name, rows: rows.length, status: "failed", note: failed });
    } else {
      summary.push({ table: name, rows: rows.length, status: "imported" });
      touched.push(name);
    }
  }

  for (const t of touched) revalidateTag(`content:${t}`);
  if (touched.length) revalidatePath("/", "layout");

  const failedCount = summary.filter((s) => s.status === "failed").length;
  return json({ ok: failedCount === 0, summary, error: failedCount ? "Some tables could not be imported. See the list below." : undefined });
}
