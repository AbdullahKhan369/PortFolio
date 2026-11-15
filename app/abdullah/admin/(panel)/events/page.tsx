import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/guard";
import { getRequestDb } from "@/lib/api/db";
import { PageHeader } from "../_s4/PageHeader";
import { btnGhost, btnPrimary, input, label, muted, panel } from "../_s4/styles";

export const metadata: Metadata = { title: "Events", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90] as const;
const MAX_ROWS = 1000;

interface EventRow {
  id: string;
  name: string;
  path: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function EventsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const days = (RANGES as readonly number[]).includes(Number(one(sp.days))) ? Number(one(sp.days)) : 30;
  const nameFilter = (one(sp.name) ?? "").trim().slice(0, 40);

  const db = await getRequestDb();
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  let query = db
    .from("events")
    .select("id,name,path,meta,created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(MAX_ROWS);
  if (nameFilter) query = query.eq("name", nameFilter);
  const { data, error } = await query;
  const rows = (data ?? []) as unknown as EventRow[];

  const summary = new Map<string, { count: number; last: string }>();
  const perDay = new Map<string, number>();
  for (const r of rows) {
    const s = summary.get(r.name);
    if (s) s.count += 1;
    else summary.set(r.name, { count: 1, last: r.created_at });
    const day = r.created_at.slice(0, 10);
    perDay.set(day, (perDay.get(day) ?? 0) + 1);
  }
  const names = [...summary.entries()].sort((a, b) => b[1].count - a[1].count);
  const peak = Math.max(1, ...perDay.values());
  const dayList = [...perDay.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 14);
  const fmtDate = (iso: string) => new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div>
      <PageHeader
        title="Events"
        intro="Anonymous actions on the public site: WhatsApp clicks, language switches, sparks found. No names, IP addresses or cookies are stored with them."
      />

      <form method="get" className={`${panel} mb-6 grid gap-4 sm:grid-cols-[160px_1fr_auto] sm:items-end`}>
        <div>
          <label htmlFor="e-days" className={label}>
            Period
          </label>
          <select id="e-days" name="days" defaultValue={String(days)} className={input}>
            {RANGES.map((d) => (
              <option key={d} value={d}>
                Last {d} days
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="e-name" className={label}>
            Event name
          </label>
          <input id="e-name" name="name" defaultValue={nameFilter} placeholder="For example cta_click" className={input} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={btnPrimary}>
            Apply filters
          </button>
          {nameFilter ? (
            <Link href="/abdullah/admin/events" className={btnGhost}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      {error ? (
        <p role="alert" className={`${panel} text-amber`}>
          Could not load events. Check the Supabase connection and that you are logged in as admin.
        </p>
      ) : rows.length === 0 ? (
        <p className={panel}>No events in this period yet. They appear after visitors click WhatsApp buttons, switch language or find a spark.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className={panel} aria-labelledby="ev-by-name">
            <h2 id="ev-by-name" className="font-display text-[1.125rem] font-semibold">
              By event
            </h2>
            <ul className="m-0 mt-3 flex list-none flex-col p-0">
              {names.map(([name, s]) => (
                <li key={name} className="flex items-baseline justify-between gap-3 border-b border-text/10 py-3 last:border-0">
                  <div className="min-w-0">
                    <p className="break-all font-display text-[15px] font-medium">{name}</p>
                    <p className={muted}>Last: {fmtDate(s.last)}</p>
                  </div>
                  <p className="font-display text-[1.25rem] font-semibold">{s.count}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className={panel} aria-labelledby="ev-by-day">
            <h2 id="ev-by-day" className="font-display text-[1.125rem] font-semibold">
              By day (latest 14 days with activity)
            </h2>
            <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
              {dayList.map(([day, n]) => (
                <li key={day} className="grid grid-cols-[96px_1fr_32px] items-center gap-3">
                  <span className={muted}>{day}</span>
                  <span aria-hidden="true" className="h-2 rounded-full bg-base">
                    <span className="block h-2 rounded-full bg-azure" style={{ width: `${Math.max(4, (n / peak) * 100)}%` }} />
                  </span>
                  <span className="text-right font-display text-[14px]">{n}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${panel} lg:col-span-2`} aria-labelledby="ev-recent">
            <h2 id="ev-recent" className="font-display text-[1.125rem] font-semibold">
              Latest 50
            </h2>
            {rows.length >= MAX_ROWS ? <p className={`${muted} mt-1`}>Totals above use the latest {MAX_ROWS} events in this period.</p> : null}
            <ul className="m-0 mt-3 flex list-none flex-col p-0">
              {rows.slice(0, 50).map((r) => (
                <li key={r.id} className="border-b border-text/10 py-3 last:border-0">
                  <p className="break-all font-display text-[15px] font-medium">{r.name}</p>
                  <p className={`${muted} break-all`}>
                    {fmtDate(r.created_at)}
                    {r.path ? `, ${r.path}` : ""}
                    {r.meta ? `, ${JSON.stringify(r.meta)}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
