import type { Metadata } from "next";
import type { Lang } from "@/lib/content/types";
import { getSiteSettings } from "@/lib/content";
import {
  BRAND,
  HTML_LANG,
  OG_LOCALE,
  SEO_FALLBACK,
  absoluteUrl,
  getSiteUrl,
  langPath,
  languageAlternates,
} from "./site";

export * from "./site";
export * from "./jsonld";

export interface BuildMetadataOptions {
  lang: Lang;
  /** Path without the language prefix: "" for home, "/legal", "/work/alley-artificials". */
  path?: string;
  /** Page title. Leave empty for the home page (uses the admin SEO title). */
  title?: string;
  description?: string;
  /** Absolute URL or path of a social image. Omit to use the generated /[lang]/opengraph-image. */
  image?: string | null;
  type?: "website" | "article";
  noindex?: boolean;
}

/**
 * Per-language metadata: title, description, canonical, hreflang, Open Graph and Twitter.
 * Replaces the minimal `generateMetadata` in app/[lang]/layout.tsx (marker MERGE:METADATA)
 * and is also meant for the legal page and S3's case-study pages.
 */
export async function buildMetadata(opts: BuildMetadataOptions): Promise<Metadata> {
  const { lang, path = "", type = "website", noindex = false } = opts;
  const settings = await getSiteSettings();
  const origin = getSiteUrl(settings);

  const siteTitle = (lang === "ur" ? settings.seo_title_ur : settings.seo_title_en)?.trim() || SEO_FALLBACK[lang].title;
  const siteDescription =
    (lang === "ur" ? settings.seo_description_ur : settings.seo_description_en)?.trim() || SEO_FALLBACK[lang].description;

  const isHome = path === "" || path === "/";
  const title = isHome || !opts.title ? siteTitle : opts.title;
  const description = opts.description?.trim() || siteDescription;
  const canonical = absoluteUrl(origin, langPath(lang, path));
  const image = opts.image ? (opts.image.startsWith("http") ? opts.image : absoluteUrl(origin, opts.image)) : null;

  return {
    metadataBase: new URL(origin),
    title: isHome || !opts.title ? { absolute: title } : { absolute: `${title} | ${BRAND.person}` },
    description,
    alternates: { canonical, languages: languageAlternates(origin, path) },
    openGraph: {
      type,
      url: canonical,
      siteName: `${BRAND.person} | ${BRAND.studio}`,
      title,
      description,
      locale: OG_LOCALE[lang],
      alternateLocale: [OG_LOCALE[lang === "en" ? "ur" : "en"]],
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    other: { "content-language": HTML_LANG[lang] },
  };
}
