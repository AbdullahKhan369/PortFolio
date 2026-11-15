// Edge-safe i18n constants (imported by middleware.ts). No server-only imports here.
import type { Lang } from "@/lib/content/types";

export const LANGS = ["en", "ur"] as const satisfies readonly Lang[];
export const DEFAULT_LANG: Lang = "en";

/** "ur" is Roman Urdu (Latin script), so the HTML language tag is ur-Latn. */
export const HTML_LANG: Record<Lang, string> = { en: "en", ur: "ur-Latn" };
/** Used for hreflang and og:locale. */
export const HREFLANG: Record<Lang, string> = { en: "en", ur: "ur-Latn" };
export const LANG_LABEL: Record<Lang, string> = { en: "English", ur: "Roman Urdu" };

/** Cookie that remembers the visitor's language. Set by the language toggle, read by middleware. */
export const LANG_COOKIE = "pa_lang";
export const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "ur";
}
