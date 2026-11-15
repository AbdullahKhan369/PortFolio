import type { Lang } from "@/lib/content/types";
import { getMessages } from "@/lib/i18n";
import { tr } from "@/components/layout/messages";

/** A slow band of big outlined words between the hero and the first section. Pure CSS; stops with reduced motion. */
export default async function Marquee({ lang }: { lang: Lang }) {
  const m = await getMessages(lang, ["hero"]);
  const words = [tr(m.hero, "roleDevTitle"), tr(m.hero, "roleAdsTitle"), tr(m.hero, "roleCreativeTitle")].filter(Boolean);
  if (words.length === 0) return null;
  const row = [...words, ...words];
  return (
    <div className="pa-marquee" aria-hidden="true">
      <div className="pa-marquee-track">
        {[0, 1].map((k) => (
          <ul key={k} className="pa-marquee-row">
            {row.map((w, i) => (
              <li key={`${k}-${i}`} data-fill={i % 2 === 0 ? "1" : undefined}>
                <span>{w}</span>
                <svg viewBox="0 0 24 24" width="0.5em" height="0.5em" focusable="false"><path d="M12 3 L21 19 H3 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
