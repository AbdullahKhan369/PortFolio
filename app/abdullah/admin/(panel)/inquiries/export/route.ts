import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/guard";
import { getRequestDb } from "@/lib/api/db";
import { filteredQuery, parseFilters, type InquiryRecord } from "../query";

export const dynamic = "force-dynamic";

const COLUMNS: (keyof InquiryRecord)[] = ["created_at", "status", "source", "lang", "niche", "name", "contact", "message", "notes"];

/** Quotes a cell and blocks spreadsheet formula injection (=, +, -, @ at the start). */
function cell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  await requireAdmin();
  const sp = Object.fromEntries(req.nextUrl.searchParams.entries());
  const filters = parseFilters(sp);

  const db = await getRequestDb();
  const { data, error } = await filteredQuery(db, filters).limit(5000);
  if (error) return new Response("Export failed. Check you are logged in as admin and try again.", { status: 500 });

  const rows = (data ?? []) as unknown as InquiryRecord[];
  const lines = [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => cell(r[c])).join(","))];
  // BOM so Excel opens Roman Urdu and other characters correctly.
  const body = `﻿${lines.join("\r\n")}\r\n`;
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inquiries-${stamp}.csv"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
