import type { CrudConfig, FieldDef } from "../kit/types";

export interface SettingsGroup { legend: string; intro?: string; fields: FieldDef[] }

// Keys match SiteSettings in lib/content/types.ts. Bilingual fields "x" read/write x_en and x_ur.
export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    legend: "Contact",
    intro: "Every WhatsApp button and contact link on the public site reads from here. Empty values are not shown at all.",
    fields: [
      { name: "whatsapp_number", label: "WhatsApp number", type: "text", placeholder: "923001234567",
        help: "With country code, digits only (no + or spaces). Pakistan example: 923001234567." },
      { name: "whatsapp_default_message", label: "Default WhatsApp message", type: "bilingual-textarea",
        help: "Pre-filled text when someone taps a WhatsApp button without a custom message." },
      { name: "linkedin_url", label: "LinkedIn link", type: "url", placeholder: "https://www.linkedin.com/in/..." },
      { name: "github_url", label: "GitHub link", type: "url" },
      { name: "email", label: "Professional email", type: "text", placeholder: "Leave empty to show no email",
        help: "If you leave this empty, no email is shown anywhere." },
    ],
  },
  {
    legend: "Home page copy",
    fields: [
      { name: "hero_headline", label: "Hero headline", type: "bilingual-textarea" },
      { name: "hero_sub", label: "Hero sub-line", type: "bilingual-textarea", help: "Optional. Empty means no sub-line." },
      { name: "availability", label: "Availability note", type: "bilingual-text",
        help: "For example your current booking status. Empty means nothing is shown." },
    ],
  },
  {
    legend: "Core Beliefs and 3-6-9 sparks",
    fields: [
      { name: "cleared_stamp", label: "Final stamp text", type: "bilingual-text", help: "Shown when every belief is ticked." },
      { name: "sparks_enabled", label: "3-6-9 sparks game", type: "boolean", help: "Turn the hidden sparks on or off." },
      { name: "audit_offer_enabled", label: "Audit offer after the sparks", type: "boolean" },
      { name: "audit_offer_text", label: "Audit offer text", type: "bilingual-text" },
    ],
  },
  {
    legend: "Site and search",
    fields: [
      { name: "site_url", label: "Site address", type: "url", placeholder: "https://yourdomain.com",
        help: "Used for links, sitemap and sharing previews. No trailing slash." },
      { name: "brand_handle", label: "Brand handle", type: "text" },
      { name: "seo_title", label: "Search title", type: "bilingual-text" },
      { name: "seo_description", label: "Search description", type: "bilingual-textarea" },
    ],
  },
];

export const SETTINGS_BOOLEANS = new Set(["sparks_enabled", "audit_offer_enabled"]);

/** A CrudConfig view of the settings, so the kit's validation and field renderers can be reused. */
export const SETTINGS_CONFIG: CrudConfig = {
  table: "site_settings",
  title: "Settings",
  singular: "Setting",
  tag: "content:site_settings",
  fields: SETTINGS_GROUPS.flatMap((g) => g.fields),
  tableColumns: [],
};
