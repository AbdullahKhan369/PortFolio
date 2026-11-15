import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/guard";
import { PageHeader } from "../_s4/PageHeader";
import BackupPanel from "./BackupPanel";

export const metadata: Metadata = { title: "Backup", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function BackupPage() {
  await requireAdmin();
  return (
    <div>
      <PageHeader
        title="Backup"
        intro="Download a copy of your content before big edits, and restore it if something goes wrong. Do this before you change the database too."
      />
      <BackupPanel />
    </div>
  );
}
