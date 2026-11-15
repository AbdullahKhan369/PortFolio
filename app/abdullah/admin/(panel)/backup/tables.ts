/**
 * Tables included in a content backup, parents first so foreign keys resolve on import.
 * `admins` is never exported or imported. `inquiries` can be exported (optional) but is never imported.
 */
export const BACKUP_TABLES = [
  { name: "site_settings", key: "key" },
  { name: "profile", key: "id" },
  { name: "achievements", key: "id" },
  { name: "core_beliefs", key: "id" },
  { name: "projects", key: "id" },
  { name: "project_media", key: "id" },
  { name: "marketing_campaigns", key: "id" },
  { name: "systems", key: "id" },
  { name: "system_nodes", key: "id" },
  { name: "system_edges", key: "id" },
  { name: "services", key: "id" },
  { name: "process_steps", key: "id" },
  { name: "niche_templates", key: "id" },
  { name: "studio_content", key: "id" },
  { name: "site_copy", key: "key" },
] as const;

export type BackupTableName = (typeof BACKUP_TABLES)[number]["name"];

export const BACKUP_APP = "prismarc-site";
export const BACKUP_VERSION = 1;
export const MAX_IMPORT_BYTES = 4 * 1024 * 1024;
export const MAX_ROWS_PER_TABLE = 5000;

export interface ImportSummaryRow {
  table: string;
  rows: number;
  status: "imported" | "skipped" | "failed";
  note?: string;
}
