// lib/admin/nav.ts (Session 1): aggregates every session's admin navigation.
import { nav as s1 } from "./nav/s1";
import { nav as s2 } from "./nav/s2";
import { nav as s3 } from "./nav/s3";
import { nav as s4 } from "./nav/s4";

export interface AdminNavItem {
  label: string;
  href: string;
  group: "Content" | "Work" | "Conversion" | "System";
}

export const NAV_GROUPS: AdminNavItem["group"][] = ["Content", "Work", "Conversion", "System"];

// Display order inside a group (slug = last URL segment). Unknown slugs go last, in the order exported.
const ORDER = [
  "profile", "achievements", "core-beliefs", "services", "studio", "site-text",
  "projects", "campaigns", "systems", "niche-templates",
  "process", "inquiries", "events", "seo",
  "appearance", "settings", "media", "backup",
];

const slugOf = (href: string) => href.split("/").filter(Boolean).pop() ?? "";
const rank = (href: string) => {
  const i = ORDER.indexOf(slugOf(href));
  return i === -1 ? ORDER.length : i;
};

export const adminNav: AdminNavItem[] = [...s1, ...s2, ...s3, ...s4]
  .map((item, index) => ({ item, index }))
  .sort((a, b) => rank(a.item.href) - rank(b.item.href) || a.index - b.index)
  .map(({ item }) => item);

export function groupedNav(): { group: AdminNavItem["group"]; items: AdminNavItem[] }[] {
  return NAV_GROUPS.map((group) => ({ group, items: adminNav.filter((i) => i.group === group) })).filter(
    (g) => g.items.length > 0,
  );
}
