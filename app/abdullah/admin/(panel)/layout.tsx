import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/shell/AdminShell";
import { adminDisplay } from "@/components/admin/shell/fonts";
import { ToastProvider } from "@/components/admin/kit/Toast";
import { groupedNav } from "@/lib/admin/nav";
import { requireAdmin } from "@/lib/supabase/guard";
import "@/components/admin/shell/admin-tailwind.css";
import "@/components/admin/shell/admin.css";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const viewport: Viewport = { themeColor: "#12163A", viewportFit: "cover" };
export const dynamic = "force-dynamic";

// Server-side guard (second lock after middleware; RLS is the third and real one).
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAdmin();
  const groups = groupedNav().map((g) => ({
    group: g.group,
    items: g.items.map(({ label, href }) => ({ label, href })),
  }));
  return (
    <html lang="en" className={adminDisplay.variable}>
      <body className="admin-root">
        <ToastProvider>
          <AdminShell groups={groups} email={user.email ?? "Admin"}>{children}</AdminShell>
        </ToastProvider>
      </body>
    </html>
  );
}
