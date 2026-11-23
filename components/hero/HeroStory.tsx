import type { CSSProperties } from "react";
import type { Lang } from "@/lib/content/types";
import { getMessages } from "@/lib/i18n";
import { tr } from "@/components/layout/messages";
import { StoryDriver } from "./StoryDriver";

/**
 * The hero film: your business goes into the prism and three jobs come out (website, ads, creative).
 * Scroll pins the stage; styles/story.css turns one number (--sp) into the whole animation.
 * Text comes from the hero namespace, so Admin > Site text edits it in English and Roman Urdu.
 * The three screens are drawn illustrations, labelled as such. No client figures are shown anywhere in it.
 */
const RAYS = [
  { key: "dev", c: "var(--c-violet)", wide: [1172, 170], tall: [400, 40] },
  { key: "ads", c: "var(--c-azure)", wide: [1172, 449], tall: [400, 150] },
  { key: "creative", c: "var(--c-mint)", wide: [1172, 728], tall: [400, 260] },
] as const;

const WINDOW: Record<string, { t: number; end: number }> = {
  dev: { t: 0.34, end: 0.56 },
  ads: { t: 0.54, end: 0.78 },
  creative: { t: 0.74, end: 1.4 },
};

const css = (v: Record<string, string | number>): CSSProperties => v as CSSProperties;

function Rays({ layout }: { layout: "wide" | "tall" }) {
  const from = layout === "wide" ? [788, 440] : [214, 150];
  return (
    <g>
      {RAYS.map((r, i) => {
        const [x, y] = r[layout];
        const w = WINDOW[r.key] as { t: number; end: number };
        const d = `M${from[0]} ${from[1]} L${x} ${y}`;
        return (
          <g key={r.key} className="pa-s-ray" style={css({ "--ri": i, "--t": w.t, "--end": w.end })}>
            <path d={d} stroke={r.c} strokeWidth={layout === "wide" ? 16 : 9} strokeLinecap="round" fill="none" pathLength={1} filter="url(#pa-story-blur)" opacity="0.55" />
            <path d={d} stroke={r.c} strokeWidth={layout === "wide" ? 4 : 2.6} strokeLinecap="round" fill="none" pathLength={1} />
            <circle cx={x} cy={y} r={layout === "wide" ? 7 : 4.5} fill={r.c} />
          </g>
        );
      })}
    </g>
  );
}

function Art({ layout }: { layout: "wide" | "tall" }) {
  const wide = layout === "wide";
  const beam = wide ? "M0 470 L599 470" : "M0 165 L119 165";
  const prism = wide ? "M700 230 L860 610 L540 610 Z" : "M170 50 L250 230 L90 230 Z";
  const inner = wide ? "M599 470 L788 440" : "M119 165 L214 150";
  const exit = wide ? [788, 440] : [214, 150];
  return (
    <svg className={`pa-story-svg pa-story-svg--${layout}`} viewBox={wide ? "0 0 1600 900" : "0 0 400 300"} focusable="false" aria-hidden="true">
      <defs>
        <linearGradient id={`pa-story-glass-${layout}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F2F4FF" stopOpacity="0.26" />
          <stop offset="0.55" stopColor="#8A5CFF" stopOpacity="0.14" />
          <stop offset="1" stopColor="#3AA0FF" stopOpacity="0.08" />
        </linearGradient>
        <filter id="pa-story-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={wide ? 9 : 5} />
        </filter>
      </defs>
      <path className="pa-s-beam" d={beam} stroke="#F2F4FF" strokeWidth={wide ? 18 : 10} strokeLinecap="round" fill="none" pathLength={1} filter="url(#pa-story-blur)" opacity="0.5" />
      <path className="pa-s-beam" d={beam} stroke="#F2F4FF" strokeWidth={wide ? 5 : 3} strokeLinecap="round" fill="none" pathLength={1} />
      <path className="pa-s-prism" d={prism} fill={`url(#pa-story-glass-${layout})`} stroke="#F2F4FF" strokeOpacity="0.6" strokeWidth={wide ? 2 : 1.4} strokeLinejoin="round" />
      <path className="pa-s-inner" d={inner} stroke="#F2F4FF" strokeWidth={wide ? 3.5 : 2} strokeLinecap="round" fill="none" pathLength={1} />
      <circle className="pa-s-flash" cx={exit[0]} cy={exit[1]} r={wide ? 16 : 9} fill="#F2F4FF" />
      <Rays layout={layout} />
    </svg>
  );
}

export default async function HeroStory({ lang }: { lang: Lang }) {
  const m = await getMessages(lang, ["hero"]);
  const h = m.hero;

  return (
    <div className="pa-story" role="region" aria-label={tr(h, "storyAria")}>
      <div className="pa-story-stage">
        <StoryDriver />
        <div className="pa-story-head">
          <p className="pa-eyebrow">{tr(h, "storyEyebrow")}</p>
          <h2 className="pa-story-title">{tr(h, "storyTitle")}</h2>
        </div>

        <div className="pa-story-canvas">
          <Art layout="wide" />
          <Art layout="tall" />

          <ul className="pa-story-cards">
            <li className="pa-story-in" data-role="in" style={css({ "--t": 0.02, "--end": 0.33 })}>
              <strong>{tr(h, "storyIn")}</strong>
              <span>{tr(h, "storyInLine")}</span>
            </li>

            <li className="pa-story-card" data-role="dev" style={css({ "--top": "3.5%", "--t": WINDOW.dev?.t ?? 0, "--end": WINDOW.dev?.end ?? 1, "--rc": "var(--c-violet)" })}>
              <div className="pa-sc-head">
                <strong>{tr(h, "roleDevTitle")}</strong>
                <span>{tr(h, "roleDevLine")}</span>
              </div>
              <div className="pa-sc-ui pa-ui-dev" aria-hidden="true">
                <div className="pa-ui-bar">
                  <i />
                  <i />
                  <i />
                  <span className="pa-ui-url">yourbusiness.com</span>
                </div>
                <div className="pa-ui-page">
                  <span className="pa-ui-h" />
                  <span className="pa-ui-h pa-ui-h--s" />
                  <div className="pa-ui-grid">
                    {[0, 1, 2, 3].map((k) => (
                      <i key={k} style={css({ "--k": k })} />
                    ))}
                  </div>
                  <span className="pa-ui-wa">{tr(h, "storyOrder")}</span>
                </div>
              </div>
            </li>

            <li className="pa-story-card" data-role="ads" style={css({ "--top": "35.5%", "--t": WINDOW.ads?.t ?? 0, "--end": WINDOW.ads?.end ?? 1, "--rc": "var(--c-azure)" })}>
              <div className="pa-sc-head">
                <strong>{tr(h, "roleAdsTitle")}</strong>
                <span>{tr(h, "roleAdsLine")}</span>
              </div>
              <div className="pa-sc-ui pa-ui-ads" aria-hidden="true">
                <div className="pa-ad">
                  <div className="pa-ad-img">
                    <svg viewBox="0 0 24 24" width="38%" height="38%" focusable="false">
                      <path d="M12 3 L21 19 H3 Z" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="pa-ad-line" />
                  <span className="pa-ad-line pa-ad-line--s" />
                  <span className="pa-ad-cta">{tr(h, "storyAdCta")}</span>
                </div>
                <div className="pa-chat">
                  <p className="pa-bub pa-bub--in" style={css({ "--k": 0 })}>{tr(h, "storyChatIn")}</p>
                  <p className="pa-bub pa-bub--out" style={css({ "--k": 1.6 })}>{tr(h, "storyChatOut")}</p>
                </div>
              </div>
            </li>

            <li className="pa-story-card" data-role="creative" style={css({ "--top": "67.5%", "--t": WINDOW.creative?.t ?? 0, "--end": WINDOW.creative?.end ?? 1, "--rc": "var(--c-mint)" })}>
              <div className="pa-sc-head">
                <strong>{tr(h, "roleCreativeTitle")}</strong>
                <span>{tr(h, "roleCreativeLine")}</span>
              </div>
              <div className="pa-sc-ui pa-ui-cre" aria-hidden="true">
                <div className="pa-poster">
                  <svg viewBox="0 0 24 24" width="34%" height="34%" focusable="false">
                    <path d="M12 3 L21 19 H3 Z" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
                  </svg>
                  <span className="pa-poster-aa">Aa</span>
                </div>
                <div className="pa-swatches">
                  {["var(--c-violet)", "var(--c-azure)", "var(--c-mint)", "var(--c-amber)"].map((c, k) => (
                    <i key={c} style={css({ "--k": k, "--sw": c })} />
                  ))}
                </div>
              </div>
            </li>
          </ul>
        </div>

        <p className="pa-story-hint" aria-hidden="true">
          {tr(h, "storyHint")}
        </p>
        <p className="pa-story-note">{tr(h, "storyNote")}</p>
      </div>
    </div>
  );
}
