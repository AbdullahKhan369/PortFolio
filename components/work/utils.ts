// Small pure helpers shared by every S3 component (work, marketing, systems, tryit, admin-s3).
// No React, no browser APIs: safe in server components, client components and plain node tests.
import type { CSSProperties } from "react";
import type { Lang } from "@/lib/content/types";

export type Accent = "violet" | "azure" | "mint" | "amber";

export function isLang(value: string): value is Lang {
  return value === "en" || value === "ur";
}

/** "Hello {name}" + { name: "Ali" } -> "Hello Ali". Unknown placeholders are left empty. */
export function fill(template: string | undefined, vars: Record<string, string | number | null | undefined> = {}): string {
  if (!template) return "";
  return template.replace(/\{(\w+)\}/g, (_m, k: string) => {
    const v = vars[k];
    return v === null || v === undefined ? "" : String(v);
  });
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const ACCENTS: Accent[] = ["violet", "azure", "mint", "amber"];

/** Project accent -> CSS custom property reference. Falls back to violet for unknown values. */
export function accentVar(accent: string | null | undefined): string {
  const a = (ACCENTS as string[]).includes(accent ?? "") ? (accent as Accent) : "violet";
  return `var(--c-${a})`;
}

// ---------- colour helpers (niche palette, admin contrast hint) ----------

export function normalizeHex(input: string | null | undefined, fallback = "#000000"): string {
  const s = (input ?? "").trim();
  const m = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(s);
  if (!m) return fallback;
  let h = m[1].toLowerCase();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return `#${h}`;
}

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function luminance(hex: string): number {
  const h = normalizeHex(hex).slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio, 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Dark or light text, whichever reads better on the given background. */
export function readableOn(bg: string): "#12163A" | "#FFFFFF" {
  return contrastRatio(bg, "#12163A") >= contrastRatio(bg, "#FFFFFF") ? "#12163A" : "#FFFFFF";
}

/** Normalises whatever a jsonb column hands back into a {bg, fg, accent} palette with safe hex values. */
export function safePalette(p: unknown): { bg: string; fg: string; accent: string } {
  const o = (p && typeof p === "object" ? p : {}) as Record<string, unknown>;
  return {
    bg: normalizeHex(typeof o.bg === "string" ? o.bg : "", "#F2F4FF"),
    fg: normalizeHex(typeof o.fg === "string" ? o.fg : "", "#12163A"),
    accent: normalizeHex(typeof o.accent === "string" ? o.accent : "", "#8A5CFF"),
  };
}

/** Typed helper for inline CSS custom properties: style={cssVars({ "--accent": "var(--c-mint)" })} */
export function cssVars(vars: Record<string, string | number>): CSSProperties {
  return vars as unknown as CSSProperties;
}

/** Only http(s) URLs from the database are rendered as links (blocks javascript: and data: URLs). */
export function safeUrl(url: string | null | undefined): string | null {
  const u = (url ?? "").trim();
  return /^https?:\/\//i.test(u) ? u : null;
}

/**
 * Same behaviour as pick() in "@/lib/i18n" (contract section 4): row[`${field}_${lang}`] ?? row[`${field}_en`] ?? "".
 * Client components use this copy so they never import the i18n loader (which belongs to the server).
 */
export function pickLang(row: object, field: string, lang: Lang): string {
  const r = row as Record<string, unknown>;
  const own = r[`${field}_${lang}`];
  if (typeof own === "string" && own.trim()) return own;
  const en = r[`${field}_en`];
  return typeof en === "string" ? en : "";
}
