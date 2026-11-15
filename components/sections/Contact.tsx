import type { Lang } from "@/lib/content/types";
import { getSiteSettings } from "@/lib/content";
import { getMessages } from "@/lib/i18n";
import { ExternalLink, WhatsAppButton } from "@/components/ui";
import ContactForm from "@/components/contact/ContactForm";

const NEW_TAB = { en: "opens in a new tab", ur: "naye tab mein khulta hai" } as const;

/** Contact: WhatsApp first, a form for people who prefer to write. Anchor id: contact. */
export default async function Contact({ lang }: { lang: Lang }) {
  const [settings, msgs] = await Promise.all([getSiteSettings(), getMessages(lang, ["contact"])]);
  const t = msgs.contact ?? {};

  const number = (settings.whatsapp_number ?? "").trim();
  const waMessage = (lang === "ur" ? settings.whatsapp_default_message_ur : settings.whatsapp_default_message_en)?.trim() ?? "";
  const availability = ((lang === "ur" ? settings.availability_ur : settings.availability_en) ?? "").trim();
  const email = (settings.email ?? "").trim();
  const linkedin = (settings.linkedin_url ?? "").trim();
  const github = (settings.github_url ?? "").trim();
  const hasLinks = !!(email || linkedin || github);

  return (
    <section id="contact" style={{ position: "relative" }} aria-labelledby="contact-heading" className="bg-base px-4 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto grid w-full max-w-[1200px] gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
        <div>
          <h2 id="contact-heading" className="font-display text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.05] text-text">
            {t.heading}
          </h2>
          <p className="mt-5 max-w-[34rem] font-body text-[18px] leading-[1.7] text-muted">{t.intro}</p>

          {number ? (
            <div className="mt-8">
              <WhatsAppButton lang={lang} number={number} message={waMessage || undefined}>
                {t.wa_cta}
              </WhatsAppButton>
            </div>
          ) : null}

          {availability ? (
            <p className="mt-8 max-w-[34rem] font-body text-[17px] leading-[1.7] text-text">
              <span className="font-display font-medium">{t.availability_label}: </span>
              {availability}
            </p>
          ) : null}

          {hasLinks ? (
            <div className="mt-8">
              <h3 className="font-display text-[1.125rem] font-semibold text-text">{t.links_heading}</h3>
              <ul className="mt-3 flex list-none flex-col gap-1 p-0">
                {email ? (
                  <li>
                    <a href={`mailto:${email}`} className="inline-flex min-h-[44px] items-center font-body text-[17px] text-text underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure">
                      <span className="sr-only">{t.email_label}: </span>
                      {email}
                    </a>
                  </li>
                ) : null}
                {linkedin ? (
                  <li>
                    <ExternalLink href={linkedin} newTabLabel={NEW_TAB[lang]} className="inline-flex min-h-[44px] items-center font-body text-[17px] text-text underline underline-offset-4">
                      {t.linkedin_label}
                    </ExternalLink>
                  </li>
                ) : null}
                {github ? (
                  <li>
                    <ExternalLink href={github} newTabLabel={NEW_TAB[lang]} className="inline-flex min-h-[44px] items-center font-body text-[17px] text-text underline underline-offset-4">
                      {t.github_label}
                    </ExternalLink>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>

        <ContactForm lang={lang} number={number} waMessage={waMessage} t={t} newTab={NEW_TAB[lang]} />
      </div>
    </section>
  );
}
