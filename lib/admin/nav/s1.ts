import type { AdminNavItem } from "../nav";

// Session 1 admin pages. Dashboard (/abdullah/admin) is added by the shell itself.
export const nav: AdminNavItem[] = [
  { label: "Profile", href: "/abdullah/admin/profile", group: "Content" },
  { label: "Achievements", href: "/abdullah/admin/achievements", group: "Content" },
  { label: "Core beliefs", href: "/abdullah/admin/core-beliefs", group: "Content" },
  { label: "Site text", href: "/abdullah/admin/site-text", group: "Content" },
  { label: "Appearance", href: "/abdullah/admin/appearance", group: "System" },
  { label: "Settings", href: "/abdullah/admin/settings", group: "System" },
  { label: "Media", href: "/abdullah/admin/media", group: "System" },
];
