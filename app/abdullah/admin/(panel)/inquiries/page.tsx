import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/guard";
import { getRequestDb } from "@/lib/api/db";
import { PageHeader } from "../_s4/PageHeader";
import { btnGhost, btnPrimary, input, label, muted, panel } from "../_s4/styles";
import InquiryCard from "./InquiryCard";
import { SOURCES, STATUSES, filteredQuery, one, parseFilters, phoneDigits, type InquiryRecord } from "./query";

export const metadata: Metadata = { title: "Inquiries", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const page = Math.max(1, Number.parseInt(one(sp.page) ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;

  const db = await getRequestDb();
  const [{ data, count, error }, newCount] = await Promise.all([
    filteredQuery(db, filters, true).range(from, from + PAGE_SIZE - 1),
    db.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);

  const rows = (data ?? []) as unknown as InquiryRecord[];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const qs = (extra: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = { ...filters, ...extra };
    for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== "") p.set(k, String(v));
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  const exportHref = `/abdullah/admin/inquiries/export${qs({ page: undefined })}`;

  return (
    <div>
      <PageHeader
        title="Inquiries"
        intro={`${newCount.count ?? 0} new. Messages from the contact form, Try your business and the free audit offer land here.`}
        actions={
          <a href={exportHref} className={btnGhost}>
            Export CSV
          </a>
        }
      />

      <form method="get" className={`${panel} mb-6 grid gap-4 sm:grid-cols-[1fr_160px_160px_auto] sm:items-end`}>
        <div>
          <label htmlFor="f-q" className={label}>
            Search
          </label>
          <input id="f-q" name="q" defaultValue={filters.q ?? ""} placeholder="Name, contact or message" className={input} />
        </div>
        <div>
          <label htmlFor="f-status" className={label}>
            Status
          </label>
          <select id="f-status" name="status" defaultValue={filters.status ?? ""} className={input}>
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-source" className={label}>
            Source
          </label>
          <select id="f-source" name="source" defaultValue={filters.source ?? ""} className={input}>
            <option value="">All</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className={btnPrimary}>
            Apply filters
          </button>
          {filters.q || filters.status || filters.source ? (
            <Link href="/abdullah/admin/inquiries" className={btnGhost}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      {error ? (
        <p role="alert" className={`${panel} text-amber`}>
          Could not load inquiries. Check the Supabase connection and that you are logged in as admin.
        </p>
      ) : rows.length === 0 ? (
        <p className={panel}>
          {filters.q || filters.status || filters.source
            ? "No inquiries match these filters. Clear them to see everything."
            : "No inquiries yet. When someone writes through the site, it appears here."}
        </p>
      ) : (
        <ul className="m-0 flex flex-col gap-4 p-0">
          {rows.map((r) => (
            <InquiryCard key={r.id} item={{ ...r, phone: phoneDigits(r.contact) }} />
          ))}
        </ul>
      )}

      {pages > 1 ? (
        <nav aria-label="Inquiry pages" className="mt-6 flex items-center justify-between gap-3">
          {page > 1 ? (
            <Link href={`/abdullah/admin/inquiries${qs({ page: page - 1 })}`} className={btnGhost}>
              Newer
            </Link>
          ) : (
            <span />
          )}
          <p className={muted}>
            Page {page} of {pages} ({total} total)
          </p>
          {page < pages ? (
            <Link href={`/abdullah/admin/inquiries${qs({ page: page + 1 })}`} className={btnGhost}>
              Older
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
