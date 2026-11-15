import type { Lang, Profile, SiteSettings, StudioContent } from "@/lib/content/types";
import { BRAND, absoluteUrl, getSiteUrl, langPath } from "./site";

type Json = Record<string, unknown>;

const compact = <T extends Json>(obj: T): T => {
  const out: Json = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out as T;
};

function sameAs(settings: SiteSettings): string[] {
  return [settings.github_url, settings.linkedin_url]
    .map((u) => (u ?? "").trim())
    .filter((u) => /^https?:\/\//i.test(u));
}

/** Person: Abdullah Khan. Only facts from the brief; no ratings, awards or invented titles. */
export function personJsonLd(opts: { lang: Lang; settings: SiteSettings; profile: Profile | null }): Json {
  const { lang, settings, profile } = opts;
  const origin = getSiteUrl(settings);
  const bio = profile ? (lang === "ur" ? profile.bio_ur : profile.bio_en) : "";
  return compact({
    "@type": "Person",
    "@id": `${origin}/#person`,
    name: profile?.name || BRAND.person,
    alternateName: settings.brand_handle || BRAND.handle,
    url: absoluteUrl(origin, langPath(lang)),
    jobTitle: "Freelance web developer and digital marketer",
    description: bio?.trim() || undefined,
    image: profile?.photo_url || undefined,
    address: { "@type": "PostalAddress", addressLocality: "Karachi", addressCountry: "PK" },
    knowsAbout: ["Web development", "Next.js", "React", "Node.js", "Supabase", "Meta Ads", "TikTok ads", "Graphic design", "Branding"],
    sameAs: sameAs(settings),
    worksFor: { "@id": `${origin}/#studio` },
    email: settings.email?.trim() ? `mailto:${settings.email.trim()}` : undefined,
  });
}

/** ProfessionalService: The Prism Arc. No team, offices, reviews or awards are claimed. */
export function studioJsonLd(opts: { lang: Lang; settings: SiteSettings; studio: StudioContent | null }): Json {
  const { lang, settings, studio } = opts;
  const origin = getSiteUrl(settings);
  const description = studio ? (lang === "ur" ? studio.tagline_ur : studio.tagline_en) : "";
  const offers = studio ? (lang === "ur" ? studio.offers_ur : studio.offers_en) : [];
  return compact({
    "@type": "ProfessionalService",
    "@id": `${origin}/#studio`,
    name: BRAND.studio,
    slogan: BRAND.studioTagline,
    description: description?.trim() || undefined,
    url: absoluteUrl(origin, langPath(lang)),
    founder: { "@id": `${origin}/#person` },
    areaServed: ["Pakistan", "United Arab Emirates", "United Kingdom", "United States", "Canada", "Australia"],
    knowsLanguage: ["en", "ur-Latn"],
    makesOffer: (offers ?? []).filter((o) => o?.trim()).map((o) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: o.trim() } })),
    sameAs: sameAs(settings),
  });
}

/** One graph with both entities, for the home page. */
export function homeJsonLd(opts: { lang: Lang; settings: SiteSettings; profile: Profile | null; studio: StudioContent | null }): Json {
  return {
    "@context": "https://schema.org",
    "@graph": [personJsonLd(opts), studioJsonLd(opts)],
  };
}

/** Breadcrumbs for inner pages (legal, case studies). */
export function breadcrumbJsonLd(items: { name: string; path: string }[], origin: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(origin, item.path),
    })),
  };
}
