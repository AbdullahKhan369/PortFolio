import type { Metadata } from "next";
import type { ReactNode } from "react";

// There is no app/layout.tsx: the public site (app/[lang]) and the admin (app/abdullah/admin/**) are separate
// root layouts. This tiny one only exists so that "/" can have a page (a redirect to /en).
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function RootRedirectLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
