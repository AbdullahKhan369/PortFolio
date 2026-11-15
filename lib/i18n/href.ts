import type { Lang } from "@/lib/content/types";
import { DEFAULT_LANG, HREFLANG, LANGS, isLang } from "./config";

/** localePath("ur", "/work/alley") -> "/ur/work/alley"; localePath("en") -> "/en". */
export function localePath(lang: Lang, path = ""): string {
  const clean = path.trim();
  if (!clean || clean === "/") return `/${lang}`;
  if (clean.startsWith("#") || clean.startsWith("?")) return `/${lang}${clean}`;
  return `/${lang}${clean.startsWith("/") ? clean : `/${clean}`}`;
}

/** Remove the leading language segment: "/ur/work/x" -> "/work/x"; "/en" -> "/". */
export function stripLang(pathname: string): string {
  const parts = pathname.split("/");
  if (parts.length > 1 && isLang(parts[1])) {
    const rest = parts.slice(2).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname || "/";
}

/** Same page in another language: switchLangPath("/en/work/x", "ur") -> "/ur/work/x". */
export function switchLangPath(pathname: string, lang: Lang): string {
  return localePath(lang, stripLang(pathname));
}

/** hreflang alternates for a page path without language, for example "/work/alley". */
export function alternatePaths(path = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of LANGS) out[HREFLANG[l]] = localePath(l, path);
  out["x-default"] = localePath(DEFAULT_LANG, path);
  return out;
}
