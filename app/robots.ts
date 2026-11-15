import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/seo/site";

/**
 * The admin path is deliberately NOT mentioned here: robots.txt is public, so listing it
 * would point people at it. The admin is protected by auth and carries noindex + X-Robots-Tag.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = getSiteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: absoluteUrl(origin, "/sitemap.xml"),
    host: origin,
  };
}
