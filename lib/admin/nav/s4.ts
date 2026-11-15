import type { AdminNavItem } from "@/lib/admin/nav";

/** Admin navigation for Session 4 pages. Hrefs match the frozen slugs in contract section 2. */
export const nav: AdminNavItem[] = [
  { label: "Inquiries", href: "/abdullah/admin/inquiries", group: "Conversion" },
  { label: "Process chat", href: "/abdullah/admin/process", group: "Conversion" },
  { label: "Events", href: "/abdullah/admin/events", group: "System" },
  { label: "SEO", href: "/abdullah/admin/seo", group: "System" },
  { label: "Backup", href: "/abdullah/admin/backup", group: "System" },
];
