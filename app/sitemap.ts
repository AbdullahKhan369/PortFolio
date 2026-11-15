import type { MetadataRoute } from "next";
import { getProjects, getSiteSettings } from "@/lib/content";
import { LANGS, absoluteUrl, getSiteUrl, langPath, languageAlternates } from "@/lib/seo/site";

/**
 * Public routes only: home, legal and tier 1 case studies, in both languages.
 * The admin area is never listed (listing it would reveal it).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let origin = getSiteUrl();
  let slugs: { slug: string; updated: string }[] = [];

  try {
    const [settings, projects] = await Promise.all([getSiteSettings(), getProjects({ tier: 1 })]);
    origin = getSiteUrl(settings);
    slugs = projects.map((p) => ({ slug: p.slug, updated: p.updated_at }));
  } catch {
    // Database unreachable at build time: ship the static routes rather than failing the build.
  }

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  const add = (path: string, priority: number, lastModified: Date) => {
    for (const lang of LANGS) {
      entries.push({
        url: absoluteUrl(origin, langPath(lang, path)),
        lastModified,
        changeFrequency: path === "" ? "monthly" : "yearly",
        priority,
        alternates: { languages: languageAlternates(origin, path) },
      });
    }
  };

  add("", 1, now);
  for (const { slug, updated } of slugs) {
    const d = new Date(updated);
    add(`/work/${slug}`, 0.8, Number.isNaN(d.getTime()) ? now : d);
  }
  add("/legal", 0.3, now);

  return entries;
}
