import type { Lang } from "@/lib/content/types";
import { getCoreBeliefs, getSiteSettings } from "@/lib/content";
import { getMessages, localePath, pick } from "@/lib/i18n";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { HeaderClient } from "./HeaderClient";
import { LanguageToggle } from "./LanguageToggle";
import { CoreBeliefsButton, type CoreBeliefsLabels } from "./CoreBeliefsButton";
import { NAV_ITEMS, sectionHref } from "./nav";
import { tr } from "./messages";

/** Server component: reads settings, nav copy and core beliefs, hands plain props to the client shell. */
export async function Header({ lang }: { lang: Lang }) {
  const [settings, beliefs, m] = await Promise.all([
    getSiteSettings(),
    getCoreBeliefs(),
    getMessages(lang, ["common", "nav", "beliefs"]),
  ]);
  const c = m.common;
  const n = m.nav;
  const b = m.beliefs;

  const links = NAV_ITEMS.map((item) => ({ id: item.id, href: sectionHref(lang, item.id), label: tr(n, item.key) }));
  const items = beliefs.map((x) => ({ id: x.id, text: pick(x, "text", lang) })).filter((x) => x.text.trim() !== "");
  const stamp = pick(settings, "cleared_stamp", lang) || tr(b, "stampDefault");
  const beliefLabels: CoreBeliefsLabels = {
    button: tr(b, "button"),
    sheetTitle: tr(b, "sheetTitle"),
    intro: tr(b, "intro"),
    progress: tr(b, "progress"),
    skip: tr(b, "skip"),
    replay: tr(b, "replay"),
    checked: tr(b, "checked"),
  };
  const waMessage = pick(settings, "whatsapp_default_message", lang) || tr(c, "waMessage");

  return (
    <HeaderClient
      homeHref={localePath(lang)}
      brand={tr(c, "brand")}
      links={links}
      labels={{
        menuOpen: tr(c, "menuOpen"),
        menuClose: tr(c, "menuClose"),
        primaryNav: tr(c, "primaryNav"),
        home: tr(c, "homeAria"),
      }}
      toggle={
        <LanguageToggle
          lang={lang}
          labels={{
            group: tr(c, "langGroup"),
            en: tr(c, "langEn"),
            ur: tr(c, "langUr"),
            enShort: tr(c, "langEnShort"),
            urShort: tr(c, "langUrShort"),
          }}
        />
      }
      beliefsBar={<CoreBeliefsButton beliefs={items} stamp={stamp} labels={beliefLabels} />}
      beliefsMenu={<CoreBeliefsButton beliefs={items} stamp={stamp} labels={beliefLabels} className="pa-beliefs-btn--menu" />}
      cta={
        <WhatsAppButton lang={lang} number={settings.whatsapp_number} message={waMessage} className="pa-header-wa">
          {tr(c, "waShort")}
        </WhatsAppButton>
      }
    />
  );
}
