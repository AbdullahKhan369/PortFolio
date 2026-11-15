import type { Lang } from "@/lib/content/types";
import { getServices, getSiteSettings } from "@/lib/content";
import { getMessages, pick } from "@/lib/i18n";
import { Morph } from "@/components/layout/Morph";
import { tr } from "@/components/layout/messages";
import { ServicesLedger, type LedgerRow } from "@/components/services/ServicesLedger";

/** Section #services: ledger of services from the services table. Each row opens WhatsApp with that service named. */
export default async function Services({ lang }: { lang: Lang }) {
  const [services, settings, m] = await Promise.all([getServices(), getSiteSettings(), getMessages(lang, ["services"])]);
  const s = m.services;

  const rows: LedgerRow[] = services.map((svc) => {
    const title = pick(svc, "title", lang);
    const includes = (lang === "ur" ? svc.includes_ur : svc.includes_en).map((x) => x.trim()).filter(Boolean);
    return {
      id: svc.id,
      title,
      audience: pick(svc, "audience", lang),
      includes,
      cta: pick(svc, "cta_label", lang) || tr(s, "ctaDefault"),
      message: tr(s, "waMessage", { title }),
    };
  });

  return (
    <section id="services" className="pa-section" style={{ position: "relative" }} aria-labelledby="pa-svc-h">
      <div className="pa-wrap">
        <header className="pa-head">
          <h2 id="pa-svc-h" className="pa-h2">
            <Morph id="svc.title" text={tr(s, "title")} />
          </h2>
          <p className="pa-lede">
            <Morph id="svc.lede" text={tr(s, "lede")} />
          </p>
        </header>
        {rows.length > 0 ? (
          <ServicesLedger
            lang={lang}
            rows={rows}
            labels={{ colService: tr(s, "colService"), colAudience: tr(s, "colAudience"), colIncludes: tr(s, "colIncludes") }}
            waNumber={settings.whatsapp_number}
          />
        ) : (
          <p className="pa-empty">{tr(s, "empty")}</p>
        )}
      </div>
    </section>
  );
}
