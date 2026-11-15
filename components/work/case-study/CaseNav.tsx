// Previous / next project links at the bottom of a case study.
import Link from "next/link";
import { localePath } from "@/lib/i18n";
import type { Lang } from "@/lib/content/types";
import styles from "../work.module.css";
import { accentVar, cssVars, cx } from "../utils";
import type { Messages, ProjectView } from "../types";

export default function CaseNav({ prev, next, lang, m }: { prev: ProjectView | null; next: ProjectView | null; lang: Lang; m: Messages }) {
  if (!prev && !next) return null;
  return (
    <nav aria-label={`${m.case_prev} / ${m.case_next}`} className={styles.caseNav}>
      {prev ? (
        <Link href={localePath(lang, `/work/${prev.slug}`)} className={styles.navLink} style={cssVars({ "--accent": accentVar(prev.accent) })}>
          <span className={styles.navHint}>{m.case_prev}</span>
          <span className={cx(styles.navTitle, "font-display")}>{prev.title}</span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
      {next && (
        <Link
          href={localePath(lang, `/work/${next.slug}`)}
          className={cx(styles.navLink, styles.navLinkNext)}
          style={cssVars({ "--accent": accentVar(next.accent) })}
        >
          <span className={styles.navHint}>{m.case_next}</span>
          <span className={cx(styles.navTitle, "font-display")}>{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
