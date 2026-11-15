// Shared constants for content caching, revalidation and the admin. Pure data, safe everywhere.
import type { SiteSettings } from "./types";

/** Every table the public site reads. Revalidation tags are `content:<table>`. */
export const CONTENT_TABLES = [
  "site_settings",
  "profile",
  "achievements",
  "core_beliefs",
  "projects",
  "project_media",
  "marketing_campaigns",
  "systems",
  "system_nodes",
  "system_edges",
  "services",
  "process_steps",
  "niche_templates",
  "studio_content",
  "site_copy",
] as const;

export type ContentTable = (typeof CONTENT_TABLES)[number];

export const contentTag = (table: string) => `content:${table}`;
export const CONTENT_TAGS: string[] = CONTENT_TABLES.map(contentTag);

/** Tags are accepted by /api/revalidate only if they match this pattern. */
export const TAG_PATTERN = /^content:[a-z_]{1,40}$/;

/** Keys of SiteSettings that hold booleans. Everything else is text. */
export const SETTING_BOOLEAN_KEYS: ReadonlyArray<keyof SiteSettings> = ["sparks_enabled", "audit_offer_enabled", "fx_spine", "fx_grain", "fx_cursor", "fx_intro", "fx_webgl"];

/** Every key the site understands (keeps the getter from leaking unknown rows). */
export const SETTING_KEYS: ReadonlyArray<keyof SiteSettings> = [
  "whatsapp_number", "whatsapp_default_message_en", "whatsapp_default_message_ur",
  "linkedin_url", "github_url", "email",
  "availability_en", "availability_ur",
  "hero_headline_en", "hero_headline_ur", "hero_sub_en", "hero_sub_ur",
  "sparks_enabled", "audit_offer_enabled", "audit_offer_text_en", "audit_offer_text_ur",
  "cleared_stamp_en", "cleared_stamp_ur",
  "site_url", "brand_handle",
  "seo_title_en", "seo_title_ur", "seo_description_en", "seo_description_ur",
  "theme_base", "theme_violet", "theme_azure", "theme_mint", "theme_amber",
  "fx_spine", "fx_grain", "fx_cursor", "fx_intro", "fx_webgl", "section_layout",
];

/** Revalidate (seconds) for cached content when nobody presses "Publish changes". */
export const CONTENT_REVALIDATE_SECONDS = 3600;
