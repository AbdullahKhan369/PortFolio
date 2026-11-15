import type { Lang } from "@/lib/content/types";
import { loadNamespace } from "./loader";
import { localePath } from "./href";

export { localePath };
export { DEFAULT_LANG, HTML_LANG, HREFLANG, LANGS, LANG_COOKIE, LANG_LABEL, isLang } from "./config";
export { alternatePaths, stripLang, switchLangPath } from "./href";

function clean(v: unknown): string | null {
  return typeof v === "string" && v.trim() !== "" ? v : null;
}

/**
 * pick(row, "title", "ur") -> row.title_ur, else row.title_en, else "".
 * An empty or whitespace-only Roman Urdu value also falls back to English
 * (a blank translation should never blank the page).
 */
export function pick<T extends object>(row: T, field: string, lang: Lang): string {
  const r = row as Record<string, unknown>;
  return clean(r[`${field}_${lang}`]) ?? clean(r[`${field}_en`]) ?? "";
}

/** getMessages("ur", ["common", "hero"]) -> { common: {...}, hero: {...} } */
export async function getMessages(
  lang: Lang,
  namespaces: string[],
): Promise<Record<string, Record<string, string>>> {
  const entries = await Promise.all(
    namespaces.map(async (ns) => [ns, await loadNamespace(ns, lang)] as const),
  );
  return Object.fromEntries(entries);
}
