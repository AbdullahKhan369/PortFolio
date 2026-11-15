import type { Lang } from "@/lib/content/types";
import { getStudioContent } from "@/lib/content";
import { getMessages, pick } from "@/lib/i18n";
import { Morph } from "@/components/layout/Morph";
import { paragraphs, tr } from "@/components/layout/messages";
import { StudioArc } from "@/components/studio/StudioArc";

/** Section #studio: The Prism Arc, Abdullah's own company. No team, clients or awards are claimed. */
export default async function Studio({ lang }: { lang: Lang }) {
  const [studio, m] = await Promise.all([getStudioContent(), getMessages(lang, ["studio"])]);
  const s = m.studio;

  const heading = (studio ? pick(studio, "heading", lang) : "") || tr(s, "heading");
  const tagline = (studio ? pick(studio, "tagline", lang) : "") || tr(s, "tagline");
  const body = (studio ? pick(studio, "body", lang) : "") || tr(s, "body");
  const offers = (studio ? (lang === "ur" ? studio.offers_ur : studio.offers_en) : [])
    .map((o) => o.trim())
    .filter(Boolean);
  const statusNote = studio ? pick(studio, "status_note", lang) : "";

  return (
    <section id="studio" className="pa-section" style={{ position: "relative" }} aria-labelledby="pa-studio-h">
      <div className="pa-wrap pa-studio">
        <header className="pa-head">
          <h2 id="pa-studio-h" className="pa-h2">
            <Morph id="studio.heading" text={heading} />
          </h2>
          <p className="pa-studio-tagline">
            <Morph id="studio.tagline" text={tagline} />
          </p>
        </header>

        <div className="pa-studio-body">
          {paragraphs(body).map((p, i) => (
            <p key={i} className="pa-body">
              <Morph id={`studio.body.${i}`} text={p} />
            </p>
          ))}
          {statusNote ? (
            <p className="pa-studio-note">
              <Morph id="studio.note" text={statusNote} />
            </p>
          ) : null}
        </div>

        {offers.length > 0 ? (
          <>
            <StudioArc count={offers.length} />
            <ul className="pa-offers" aria-label={tr(s, "offersAria")}>
              {offers.map((o, i) => (
                <li key={i} className={`pa-offer pa-c${i % 4}`}>
                  <Morph id={`studio.offer.${i}`} text={o} />
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </section>
  );
}
