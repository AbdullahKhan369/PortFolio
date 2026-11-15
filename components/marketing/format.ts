// Formatting for campaign receipts. Pure functions, no React.
import type { Lang, MarketingCampaign } from "@/lib/content/types";
import { fill } from "@/components/work/utils";

/** Money with the campaign's own currency code. Never invents a value: callers pass only real numbers. */
export function formatMoney(amount: number, currency: string): string {
  const code = (currency || "").trim().toUpperCase();
  try {
    if (/^[A-Z]{3}$/.test(code)) {
      return new Intl.NumberFormat("en-PK", { style: "currency", currency: code, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
    }
  } catch {
    /* unknown currency code: fall through to the plain format */
  }
  return `${code ? code + " " : ""}${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(amount)}`;
}

/** "2026-03-01" -> "1 Mar 2026". Empty string if the date is missing or invalid. */
export function formatDate(iso: string | null | undefined): string {
  const s = (iso ?? "").trim();
  if (!s) return "";
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T00:00:00Z` : s);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(d);
}

export function formatRan(c: Pick<MarketingCampaign, "start_date" | "end_date">, m: Record<string, string>): string {
  const from = formatDate(c.start_date);
  const to = formatDate(c.end_date);
  if (from && to) return fill(m.ran_range, { from, to });
  if (from) return fill(m.ran_from, { from });
  if (to) return fill(m.ran_until, { to });
  return "";
}

export type PlatformKey = MarketingCampaign["platform"];

export function platformLabel(p: string, m: Record<string, string>): string {
  return m[`platform_${p}`] ?? m.platform_other ?? p;
}

export function platformColor(p: string): string {
  switch (p) {
    case "meta":
      return "var(--c-azure)";
    case "tiktok":
      return "var(--c-mint)";
    case "google":
      return "var(--c-amber)";
    case "linkedin":
      return "var(--c-violet)";
    default:
      return "var(--c-muted)";
  }
}

export function receiptLang(lang: Lang): Lang {
  return lang === "ur" ? "ur" : "en";
}
