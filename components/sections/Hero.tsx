import { getCopyOverrides } from "@/lib/content/copy";
import { Fragment, type CSSProperties } from "react";
import type { Lang } from "@/lib/content/types";
import { getProfile, getSiteSettings } from "@/lib/content";
import { getMessages, pick } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Morph } from "@/components/layout/Morph";
import { tr } from "@/components/layout/messages";
import { Intro369 } from "@/components/hero/Intro369";
import { PrismScene } from "@/components/hero/PrismScene";
import { PrismStage } from "@/components/hero/PrismStage";
import { PrismPointer } from "@/components/hero/PrismPointer";

/** "I build the site. I run the ads. You get the messages." becomes three short lines, each word revealed in turn. */
function splitLines(text: string): string[][] {
  return (text.match(/[^.!?\n]+[.!?]*/g) ?? [text])
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split(/\s+/));
}

/**
 * Section #hero. Mobile first: a short three-line statement, one thumb-reach pair of buttons, and the real-time prism under the text.
 * The WebGL prism (PrismStage) replaces the SVG prism (PrismScene) when the device can run it.
 */
export default async function Hero({ lang }: { lang: Lang }) {
  const [settings, profile, m, copy] = await Promise.all([getSiteSettings(), getProfile(), getMessages(lang, ["hero", "common"]), getCopyOverrides()]);
  const h = m.hero;
  const c = m.common;

  const name = profile?.name?.trim() || tr(c, "brand");
  // Priority: what you saved in Admin > Site text, then Admin > Settings, then the built-in text.
  // (Before, Settings always won, so a Site text edit of hero.headline or hero.sub never showed.)
  const edited = (key: string): string => (copy[key]?.[lang] ?? "").trim();
  const headline = edited("hero.headline") || pick(settings, "hero_headline", lang) || tr(h, "headline");
  const sub = edited("hero.sub") || pick(settings, "hero_sub", lang) || tr(h, "sub");
  const availability = pick(settings, "availability", lang);
  const waMessage = edited("common.waMessage") || pick(settings, "whatsapp_default_message", lang) || tr(c, "waMessage");

  const roles = [
    { key: "dev", title: tr(h, "roleDevTitle"), line: tr(h, "roleDevLine") },
    { key: "ads", title: tr(h, "roleAdsTitle"), line: tr(h, "roleAdsLine") },
    { key: "creative", title: tr(h, "roleCreativeTitle"), line: tr(h, "roleCreativeLine") },
  ];

  const lines = splitLines(headline);
  let wordIndex = 0;

  return (
    <section id="hero" className="pa-hero pa-hero2" style={{ position: "relative" }} aria-labelledby="pa-hero-h1">
      <Intro369 skipLabel={tr(c, "introSkip")} />
      <PrismStage />
      <PrismPointer />
      <div className="pa-hero2-grid">
        <div className="pa-hero2-text">
          <p className="pa-hero2-name pa-reveal pa-d0">
            <span className="pa-hero2-dot" aria-hidden="true" />
            {name}
          </p>
          <h1 id="pa-hero-h1" className="pa-hero2-h1" aria-label={headline}>
            {lines.map((words, li) => (
              <span key={li} className="pa-line" data-last={li === lines.length - 1 ? "1" : undefined} aria-hidden="true">
                {words.map((w) => {
                  const i = wordIndex++;
                  return (
                    <Fragment key={i}>
                      <span className="pa-word" style={{ "--w": i } as CSSProperties}>
                        <span>{w}</span>
                      </span>{" "}
                    </Fragment>
                  );
                })}
              </span>
            ))}
          </h1>
          <p className="pa-hero2-sub pa-reveal pa-d2">
            <Morph id="hero.sub" text={sub} />
          </p>
          <div className="pa-hero-cta pa-reveal pa-d3">
            <WhatsAppButton lang={lang} number={settings.whatsapp_number} message={waMessage} className="pa-btn--lg" />
            <Button variant="ghost" size="lg" href="#projects">
              <Morph id="hero.ctaWork" text={tr(h, "ctaWork")} />
            </Button>
          </div>
          {availability ? (
            <p className="pa-hero-avail pa-reveal pa-d4">
              <Morph id="hero.availability" text={availability} />
            </p>
          ) : null}
        </div>

        <PrismScene />
      </div>

      <ul className="pa-hero2-roles pa-reveal pa-d4" aria-label={tr(h, "rolesAria")}>
        {roles.map((r) => (
          <li key={r.key} className="pa-hero2-role" data-role={r.key}>
            <span className="pa-hero2-role-bar" aria-hidden="true" />
            <strong>{r.title}</strong>
            <span>{r.line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
