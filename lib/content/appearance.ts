// Pure helpers for Admin > Appearance: theme colours, effect switches and the home section order.
import type { SiteSettings } from "./types";

export const HOME_SECTIONS = ["achievements", "projects", "marketing", "systems", "services", "process", "try", "studio", "about", "contact"] as const;
export type HomeSectionId = (typeof HOME_SECTIONS)[number];
export interface SectionSlot { id: HomeSectionId; visible: boolean }

export const SECTION_LABELS: Record<HomeSectionId, string> = {
  achievements: "Achievements", projects: "Projects", marketing: "Marketing projects", systems: "Systems map",
  services: "Services", process: "How I work", try: "Try your business", studio: "Studio (The Prism Arc)",
  about: "About", contact: "Contact",
};

const isSection = (v: unknown): v is HomeSectionId => typeof v === "string" && (HOME_SECTIONS as readonly string[]).includes(v);

/** Default order, with the saved order and visibility applied. Unknown ids are dropped, missing ids are appended (visible). */
export function parseSectionLayout(raw: string | undefined): SectionSlot[] {
  const out: SectionSlot[] = [];
  try {
    const data: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(data)) {
      for (const item of data) {
        if (!item || typeof item !== "object") continue;
        const { id, visible } = item as { id?: unknown; visible?: unknown };
        if (isSection(id) && !out.some((s) => s.id === id)) out.push({ id, visible: visible !== false });
      }
    }
  } catch {
    // bad JSON: fall back to the default order
  }
  for (const id of HOME_SECTIONS) if (!out.some((s) => s.id === id)) out.push({ id, visible: true });
  return out;
}

export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const THEME_VARS: [keyof SiteSettings, string][] = [
  ["theme_base", "--c-base"], ["theme_violet", "--c-violet"], ["theme_azure", "--c-azure"], ["theme_mint", "--c-mint"], ["theme_amber", "--c-amber"],
];

/** CSS that overrides the colour tokens. Only #RRGGBB values pass, so nothing else can reach the stylesheet. */
export function themeCss(s: SiteSettings): string {
  const parts: string[] = [];
  for (const [key, cssVar] of THEME_VARS) {
    const v = s[key];
    if (typeof v === "string" && HEX_COLOR.test(v)) parts.push(`${cssVar}:${v}`);
  }
  return parts.length ? `:root{${parts.join(";")}}` : "";
}

/** data-fx-* attributes for <html>: only the switched-off effects get one. */
export function fxAttributes(s: SiteSettings): Record<string, string> {
  const out: Record<string, string> = {};
  if (s.fx_spine === false) out["data-fx-spine"] = "off";
  if (s.fx_grain === false) out["data-fx-grain"] = "off";
  if (s.fx_cursor === false) out["data-fx-cursor"] = "off";
  if (s.fx_intro === false) out["data-fx-intro"] = "off";
  if (s.fx_webgl === false) out["data-fx-webgl"] = "off";
  return out;
}
