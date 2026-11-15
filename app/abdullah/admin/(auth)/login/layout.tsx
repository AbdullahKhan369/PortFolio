import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { adminDisplay } from "@/components/admin/shell/fonts";
import "@/components/admin/shell/admin-tailwind.css";
import "@/components/admin/shell/admin.css";

// No app/layout.tsx exists (the public layout lives in app/[lang]), so each admin route group is its own root layout.
export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const viewport: Viewport = { themeColor: "#12163A", viewportFit: "cover" };

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={adminDisplay.variable}>
      <body className="admin-root">{children}</body>
    </html>
  );
}
