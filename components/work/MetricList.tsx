// Renders only metrics that have a value (contract section 3: empty values are never shown).
import { hasValue } from "@/lib/content/visible";
import { pick } from "@/lib/i18n";
import type { Lang, Metric } from "@/lib/content/types";
import styles from "./work.module.css";

export default function MetricList({ metrics, lang, label }: { metrics: Metric[] | null | undefined; lang: Lang; label: string }) {
  const shown = (metrics ?? []).filter((m) => hasValue(m?.value) && hasValue(pick(m, "label", lang)));
  if (shown.length === 0) return null;
  return (
    <section aria-label={label}>
      <dl className={styles.metrics}>
        {shown.map((m, i) => (
          <div className={styles.metric} key={`${m.label_en}-${i}`}>
            <dd className="font-display">{String(m.value).trim()}</dd>
            <dt>{pick(m, "label", lang)}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
