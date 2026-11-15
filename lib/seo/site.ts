import type { Lang, SiteSettings } from "@/lib/content/types";

export const LANGS: readonly Lang[] = ["en", "ur"] as const;

export function isLang(value: string | undefined | null): value is Lang {
  return value === "en" || value === "ur";
}

/** HTML lang and hreflang value. Roman Urdu is Urdu written in Latin script. */
export const HTML_LANG: Record<Lang, string> = { en: "en", ur: "ur-Latn" };
export const OG_LOCALE: Record<Lang, string> = { en: "en_US", ur: "ur_PK" };

export const BRAND = {
  person: "Abdullah Khan",
  handle: "AbdullahKhan_369",
  studio: "The Prism Arc",
  studioTagline: "Where Businesses Evolve",
} as const;

/** Used only when the admin has not filled the SEO fields yet. */
export const SEO_FALLBACK: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Abdullah Khan: websites and ads that fill your WhatsApp",
    description: "I build the website and run the ads that fill your WhatsApp. Web developer and digital marketer in Karachi, working with businesses in Pakistan and abroad.",
  },
  ur: {
    title: "Abdullah Khan: website aur ads jo aapka WhatsApp bhar dein",
    description: "Main aapki website banata hoon aur woh ads chalata hoon jo aapke WhatsApp ko inquiries se bhar dein. Karachi se web developer aur digital marketer.",
  },
};

/** Canonical origin, no trailing slash. Env wins, then the admin setting, then localhost. */
export function getSiteUrl(settings?: Pick<SiteSettings, "site_url">): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || settings?.site_url || "http://localhost:3000";
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, "");
}

/** "/en" + path, with a single slash between. `path` may be "" or start with "/". */
export function langPath(lang: Lang, path = ""): string {
  const clean = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `/${lang}${clean === "/" ? "" : clean}`;
}

export function absoluteUrl(origin: string, path: string): string {
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

/** hreflang map for a path that exists in both languages, plus x-default (English). */
export function languageAlternates(origin: string, path = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of LANGS) out[HTML_LANG[l]] = absoluteUrl(origin, langPath(l, path));
  out["x-default"] = absoluteUrl(origin, langPath("en", path));
  return out;
}
