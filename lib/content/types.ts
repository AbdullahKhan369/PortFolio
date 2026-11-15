// lib/content/types.ts (Session 1). Others import types from "@/lib/content/types".
// Copied from contract.md section 4. Do not change without updating the contract.
export type Lang = "en" | "ur";
export interface Metric { label_en: string; label_ur: string; value: string | null }
export interface Base { id: string; is_visible: boolean; order_index: number; created_at: string; updated_at: string }

export interface SiteSettings {
  whatsapp_number?: string; whatsapp_default_message_en?: string; whatsapp_default_message_ur?: string;
  linkedin_url?: string; github_url?: string; email?: string;
  availability_en?: string; availability_ur?: string;
  hero_headline_en?: string; hero_headline_ur?: string; hero_sub_en?: string; hero_sub_ur?: string;
  sparks_enabled?: boolean; audit_offer_enabled?: boolean; audit_offer_text_en?: string; audit_offer_text_ur?: string;
  cleared_stamp_en?: string; cleared_stamp_ur?: string;
  site_url?: string; brand_handle?: string;
  seo_title_en?: string; seo_title_ur?: string; seo_description_en?: string; seo_description_ur?: string;
  /** Appearance (Admin > Appearance). Colours are #RRGGBB. fx_* absent means on. section_layout is JSON text. */
  theme_base?: string; theme_violet?: string; theme_azure?: string; theme_mint?: string; theme_amber?: string;
  fx_spine?: boolean; fx_grain?: boolean; fx_cursor?: boolean; fx_intro?: boolean; fx_webgl?: boolean; section_layout?: string;
}
export interface Profile extends Base { name: string; tagline_en: string; tagline_ur: string; bio_en: string; bio_ur: string; photo_url: string | null; photo_layers: { dev?: string; ads?: string; creative?: string } | null }
export interface Achievement extends Base { title_en: string; title_ur: string; description_en: string | null; description_ur: string | null; year: number | null; kind: "course" | "certificate" | "result" | "work" | "other"; image_url: string | null; proof_url: string | null }
export interface CoreBelief extends Base { text_en: string; text_ur: string }
export interface Project extends Base { slug: string; title: string; tier: 1 | 2 | 3; category: "client" | "hackathon" | "tool" | "design-lab"; summary_en: string; summary_ur: string; role_en: string | null; role_ur: string | null; stack: string[]; live_url: string | null; repo_url: string | null; cover_url: string | null; status: "live" | "in-progress" | "archived"; is_featured: boolean; accent: "violet" | "azure" | "mint" | "amber"; metrics: Metric[];
  /** Optional case-study copy (supabase/migrations/s3_project_story.sql). Empty when the migration has not run. */
  story_en?: string | null; story_ur?: string | null; highlights_en?: string[]; highlights_ur?: string[] }
export interface ProjectMedia extends Base { project_id: string; url: string; kind: "desktop" | "mobile" | "video" | "other"; caption_en: string | null; caption_ur: string | null }
export interface ProjectWithMedia extends Project { media: ProjectMedia[] }
export interface MarketingCampaign extends Base { title: string; client_label: string | null; platform: "meta" | "tiktok" | "google" | "linkedin" | "other"; objective_en: string; objective_ur: string; start_date: string | null; end_date: string | null; spend: number | null; currency: string; results: Metric[]; notes_en: string | null; notes_ur: string | null; project_id: string | null }
export interface SystemNode extends Base { system_id: string; key: string; label_en: string; label_ur: string; kind: "service" | "db" | "ai" | "queue" | "client" | "api" | "other"; description_en: string | null; description_ur: string | null; x: number; y: number }
export interface SystemEdge extends Base { system_id: string; from_key: string; to_key: string; label_en: string | null; label_ur: string | null }
export interface SystemWithGraph extends Base { slug: string; title_en: string; title_ur: string; description_en: string; description_ur: string; nodes: SystemNode[]; edges: SystemEdge[] }
export interface Service extends Base { title_en: string; title_ur: string; audience_en: string; audience_ur: string; includes_en: string[]; includes_ur: string[]; cta_label_en: string; cta_label_ur: string }
export interface ProcessStep extends Base { sender: "abdullah" | "client"; message_en: string; message_ur: string }
export interface NicheTemplate extends Base { key: string; label_en: string; label_ur: string; palette: { bg: string; fg: string; accent: string }; headline_en: string; headline_ur: string; sample_items: { name_en: string; name_ur: string; price?: string }[] }
export interface StudioContent extends Base { heading_en: string; heading_ur: string; tagline_en: string; tagline_ur: string; body_en: string; body_ur: string; offers_en: string[]; offers_ur: string[]; status_note_en: string | null; status_note_ur: string | null }
