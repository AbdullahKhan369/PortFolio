import type { Lang } from "@/lib/content/types";
import { localePath } from "@/lib/i18n";

/** Header / menu links. `id` is the section anchor id from contract section 2, `key` is the nav.* message key. */
export const NAV_ITEMS = [
  { id: "achievements", key: "achievements" },
  { id: "projects", key: "projects" },
  { id: "services", key: "services" },
  { id: "studio", key: "studio" },
  { id: "about", key: "about" },
  { id: "contact", key: "contact" },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]["key"];

/** `/en#projects`. Works from the home page and from /work/[slug]. */
export function sectionHref(lang: Lang, id: string): string {
  return `${localePath(lang)}#${id}`;
}
