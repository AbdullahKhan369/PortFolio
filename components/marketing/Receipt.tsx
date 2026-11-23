// One campaign receipt. Presentational (no hooks) so it works inside the client ReceiptStack and on the server.
// Every number goes through hasValue(): empty spend / results are not rendered at all (contract section 3).
import Link from "next/link";
import { hasValue } from "@/lib/content/visible";
import type { Lang, MarketingCampaign } from "@/lib/content/types";
import { cssVars, cx, fill, pickLang } from "@/components/work/utils";
import { formatMoney, formatRan, platformColor, platformLabel } from "./format";
import styles from "./marketing.module.css";

export interface ReceiptProject {
  title: string;
  href: string;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.row}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Leader({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.leader}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function Receipt({ c, lang, m, project }: { c: MarketingCampaign; lang: Lang; m: Record<string, string>; project?: ReceiptProject | null }) {
  const objective = pickLang(c, "objective", lang);
  const notes = pickLang(c, "notes", lang);
  const ran = formatRan(c, m);
  const hasSpend = hasValue(c.spend) && typeof c.spend === "number";
  const results = (c.results ?? []).filter((r) => hasValue(r?.value) && hasValue(pickLang(r, "label", lang)));
  const noFigures = !hasSpend && results.length === 0;

  return (
    <article className={styles.paper} aria-label={fill(m.receipt_label, { title: c.title })}>
      <div className={styles.body}>
        <header className={styles.head}>
          <span className={styles.swatch} style={cssVars({ "--swatch": platformColor(c.platform) })} aria-hidden="true" />
          <h3 className={cx(styles.title, "font-display")}>{c.title}</h3>
        </header>

        <dl className={styles.rows}>
          <Row label={m.line_platform}>{platformLabel(c.platform, m)}</Row>
          {hasValue(c.client_label) && <Row label={m.line_client}>{c.client_label}</Row>}
          {hasValue(objective) && <Row label={m.line_objective}>{objective}</Row>}
        </dl>

        {(ran || hasSpend) && (
          <dl className={styles.leaders}>
            {ran && <Leader label={m.line_ran} value={ran} />}
            {hasSpend && <Leader label={m.line_spend} value={formatMoney(c.spend as number, c.currency)} />}
          </dl>
        )}

        {results.length > 0 && (
          <div className={styles.results}>
            <p className={styles.resultsTitle}>{m.line_results}</p>
            <dl className={styles.leaders}>
              {results.map((r, i) => (
                <Leader key={`${r.label_en}-${i}`} label={pickLang(r, "label", lang)} value={String(r.value).trim()} />
              ))}
            </dl>
          </div>
        )}

        {hasValue(notes) && <p className={cx(styles.notes, "font-body")}>{notes}</p>}

        {project && (
          <Link href={project.href} className={styles.projectLink}>
            {m.view_project}
            <span className="sr-only">: {project.title}</span>
          </Link>
        )}

        {!noFigures && <p className={styles.foot}>{m.recorded_note}</p>}
      </div>
      <div className={styles.teeth} aria-hidden="true" />
    </article>
  );
}
