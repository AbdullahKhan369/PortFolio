import type { Db } from "@/lib/api/db";

export const STATUSES = ["new", "contacted", "won", "lost", "spam"] as const;
export const SOURCES = ["form", "configurator", "sparks"] as const;

export interface InquiryFilters {
  status?: string;
  source?: string;
  q?: string;
}

export interface InquiryRecord {
  id: string;
  name: string | null;
  contact: string;
  message: string;
  niche: string | null;
  source: string;
  status: string;
  notes: string | null;
  lang: string | null;
  created_at: string;
}

/** Reads one value from a Next searchParams entry. */
export const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function parseFilters(sp: Record<string, string | string[] | undefined>): InquiryFilters {
  const status = one(sp.status);
  const source = one(sp.source);
  const q = (one(sp.q) ?? "").trim().slice(0, 80);
  return {
    status: (STATUSES as readonly string[]).includes(status ?? "") ? status : undefined,
    source: (SOURCES as readonly string[]).includes(source ?? "") ? source : undefined,
    q: q || undefined,
  };
}

/** Builds the filtered query used by both the inbox and the CSV export. */
export function filteredQuery(db: Db, f: InquiryFilters, countExact = false) {
  let query = db
    .from("inquiries")
    .select("id,name,contact,message,niche,source,status,notes,lang,created_at", countExact ? { count: "exact" } : undefined)
    .order("created_at", { ascending: false });
  if (f.status) query = query.eq("status", f.status);
  if (f.source) query = query.eq("source", f.source);
  if (f.q) {
    // Strip characters that have meaning inside a PostgREST or() filter.
    const safe = f.q.replace(/[%,()*\\]/g, " ").trim();
    if (safe) query = query.or(`name.ilike.%${safe}%,contact.ilike.%${safe}%,message.ilike.%${safe}%`);
  }
  return query;
}

/** Digits of a phone-looking contact, or null when it is an email or handle. */
export function phoneDigits(contact: string): string | null {
  if (/[a-z@]/i.test(contact)) return null;
  const digits = contact.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}
