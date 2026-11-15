import SparkAnchor from "@/components/sparks/SparkAnchor";
import type { Lang } from "@/lib/content/types";
import { getAchievements } from "@/lib/content";
import { getMessages, pick } from "@/lib/i18n";
import { Morph } from "@/components/layout/Morph";
import { tr } from "@/components/layout/messages";
import { CometTimeline, type TimelineItem } from "@/components/achievements/CometTimeline";

/** Hafiz-e-Quran is shown plainly: same milestone, no glow and no accent colour. */
const QUIET = /h[aā]fi[zd]|hifz|qur'?[aā]n/i;

/** Section #achievements. Every milestone comes from the achievements table (admin). */
export default async function Achievements({ lang }: { lang: Lang }) {
  const [rows, m] = await Promise.all([getAchievements(), getMessages(lang, ["achievements", "common"])]);
  const a = m.achievements;

  const items: TimelineItem[] = rows.map((row) => {
    const title = pick(row, "title", lang);
    const kindKey = `kind${row.kind.charAt(0).toUpperCase()}${row.kind.slice(1)}`;
    return {
      id: row.id,
      title,
      description: pick(row, "description", lang) || null,
      year: row.year,
      kind: row.kind,
      kindLabel: tr(a, kindKey),
      imageUrl: row.image_url,
      proofUrl: row.proof_url,
      quiet: QUIET.test(row.title_en) || QUIET.test(row.title_ur),
    };
  });

  return (
    <section id="achievements" className="pa-section" style={{ position: "relative" }} aria-labelledby="pa-ach-h">
      <div className="pa-wrap">
        <header className="pa-head">
          <h2 id="pa-ach-h" className="pa-h2">
            <Morph id="ach.title" text={tr(a, "title")} />
          </h2>
          <p className="pa-lede">
            <Morph id="ach.lede" text={tr(a, "lede")} />
          </p>
        </header>

        {items.length > 0 ? (
          <CometTimeline
            items={items}
            labels={{
              viewProof: tr(a, "viewProof"),
              scanPlaceholder: tr(a, "scanPlaceholder"),
              openScan: tr(a, "openScan"),
              scanAlt: tr(a, "scanAlt"),
              newTab: tr(m.common, "newTab"),
            }}
          />
        ) : (
          <p className="pa-empty">{tr(a, "empty")}</p>
        )}
      </div>
      <SparkAnchor n={3} />
    </section>
  );
}
