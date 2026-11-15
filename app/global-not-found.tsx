import type { CSSProperties } from "react";
import en from "@/lib/i18n/messages/errors.en.json";
import ur from "@/lib/i18n/messages/errors.ur.json";

/**
 * Root 404 for URLs outside /en and /ur. Self-contained: inline styles with the frozen token
 * values, so it still looks right even if no stylesheet is loaded on this path. Shows both
 * languages because no language is known here.
 *
 * Merge change: it is now app/global-not-found.tsx (next.config.ts: experimental.globalNotFound) and renders its
 * own <html>/<body>, because the project has several root layouts and no app/layout.tsx.
 */
export const metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function GlobalNotFound() {
  const wrap: CSSProperties = {
    minHeight: "100dvh",
    background: "#12163A",
    color: "#F2F4FF",
    padding: "96px 16px",
    fontFamily: "Georgia, serif",
  };
  const link: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 52,
    padding: "0 28px",
    borderRadius: 999,
    background: "#F2F4FF",
    color: "#12163A",
    fontFamily: "system-ui, sans-serif",
    fontWeight: 600,
    textDecoration: "none",
  };
  return (
    <html lang="en">
    <body style={{ margin: 0, background: "#12163A" }}>
    <main id="main" style={wrap}>
      <div style={{ maxWidth: 704, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "system-ui, sans-serif", fontSize: "clamp(2rem,8vw,3.5rem)", lineHeight: 1.08, margin: 0 }}>
          {en.not_found_title}
        </h1>
        <p style={{ color: "#9096C4", fontSize: 18, lineHeight: 1.7 }}>{en.not_found_body}</p>
        <p style={{ margin: "32px 0 0" }}>
          <a href="/en" style={link}>
            {en.home}
          </a>
        </p>
        <hr style={{ border: 0, borderTop: "1px solid rgba(242,244,255,.15)", margin: "56px 0" }} />
        <p lang="ur-Latn" style={{ fontFamily: "system-ui, sans-serif", fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
          {ur.not_found_title}
        </p>
        <p lang="ur-Latn" style={{ color: "#9096C4", fontSize: 18, lineHeight: 1.7 }}>
          {ur.not_found_body}
        </p>
        <p style={{ margin: "24px 0 0" }}>
          <a href="/ur" lang="ur-Latn" style={link}>
            {ur.home}
          </a>
        </p>
      </div>
    </main>
    </body>
    </html>
  );
}
