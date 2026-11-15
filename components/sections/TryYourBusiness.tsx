// Home section "try" (anchor id: try). Niche templates come from admin; the WhatsApp number from site settings.
import { getNicheTemplates, getSiteSettings } from "@/lib/content";
import { getMessages, pick } from "@/lib/i18n";
import type { Lang } from "@/lib/content/types";
import Configurator from "@/components/tryit/Configurator";
import type { MiniNiche } from "@/components/tryit/MiniHome";
import { safePalette } from "@/components/work/utils";

export default async function TryYourBusiness({ lang }: { lang: Lang }) {
  const [templates, settings, messages] = await Promise.all([getNicheTemplates(), getSiteSettings(), getMessages(lang, ["tryit"])]);
  const m = messages.tryit ?? {};

  const niches: MiniNiche[] = templates.map((t) => ({
    key: t.key,
    label: pick(t, "label", lang),
    headline: pick(t, "headline", lang),
    palette: safePalette(t.palette),
    items: (Array.isArray(t.sample_items) ? t.sample_items : [])
      .map((it) => ({ name: pick(it, "name", lang), price: typeof it.price === "string" ? it.price : undefined }))
      .filter((it) => it.name),
  }));

  return (
    <section id="try" style={{ position: "relative" }} aria-labelledby="try-title" className="px-5 py-20 md:px-10 md:py-28 lg:px-16">
      <div className="mx-auto w-full max-w-[1280px]">
        <header className="mb-10 max-w-3xl md:mb-14">
          <h2 id="try-title" className="font-display text-[clamp(2rem,6vw,3.75rem)] leading-[1.04] tracking-tight text-text">
            {m.heading}
          </h2>
          <p className="font-body mt-4 max-w-[62ch] text-lg leading-relaxed text-muted">{m.intro}</p>
        </header>

        {niches.length === 0 ? (
          <p className="font-body text-muted">{m.empty}</p>
        ) : (
          <Configurator lang={lang} niches={niches} whatsappNumber={settings.whatsapp_number} m={m} />
        )}
      </div>
    </section>
  );
}
