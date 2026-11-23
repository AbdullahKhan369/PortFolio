import Link from "next/link";
import type { Lang } from "@/lib/content/types";
import { getSiteSettings } from "@/lib/content";
import { getMessages, localePath, pick } from "@/lib/i18n";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { PrismGlyph } from "@/components/ui/PrismGlyph";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { tr } from "./messages";

/** Footer: brand, outbound links that exist, legal, back to top. Empty contact fields are never rendered. */
export async function Footer({ lang }: { lang: Lang }) {
  const [settings, m] = await Promise.all([getSiteSettings(), getMessages(lang, ["common"])]);
  const c = m.common;
  const newTab = tr(c, "newTab");
  const github = settings.github_url?.trim() || "https://github.com/AbdullahKhan369";
  const linkedin = settings.linkedin_url?.trim();
  const email = settings.email?.trim();
  const waMessage = pick(settings, "whatsapp_default_message", lang) || tr(c, "waMessage");
  const year = new Date().getFullYear();

  return (
    <footer className="pa-footer">
      <div className="pa-wrap pa-footer-grid">
        <div className="pa-footer-brand">
          <p className="pa-footer-name">
            <PrismGlyph size={26} />
            <span>{tr(c, "brand")}</span>
          </p>
          <p className="pa-footer-tagline">{tr(c, "footerTagline")}</p>
          <p className="pa-footer-note">{tr(c, "footerStudio")}</p>
          <WhatsAppButton lang={lang} number={settings.whatsapp_number} message={waMessage} className="pa-footer-wa" />
        </div>

        <nav className="pa-footer-links" aria-label={tr(c, "footerNav")}>
          <ul>
            <li>
              <ExternalLink href={github} newTabLabel={newTab}>
                {tr(c, "github")}
              </ExternalLink>
            </li>
            {linkedin ? (
              <li>
                <ExternalLink href={linkedin} newTabLabel={newTab}>
                  {tr(c, "linkedin")}
                </ExternalLink>
              </li>
            ) : null}
            {email ? (
              <li>
                <a href={`mailto:${email}`}>{email}</a>
              </li>
            ) : null}
            <li>
              <Link href={`${localePath(lang)}/legal`}>{tr(c, "footerLegal")}</Link>
            </li>
            <li>
              <a href="#hero">{tr(c, "backToTop")}</a>
            </li>
          </ul>
        </nav>
      </div>
      <p className="pa-footer-mark" aria-hidden="true">
        {tr(c, "brand")}
      </p>
      <div className="pa-wrap pa-footer-base">
        <p>{tr(c, "footerCopyright", { year })}</p>
        <p>{tr(c, "footerHandle")}</p>
      </div>
    </footer>
  );
}
