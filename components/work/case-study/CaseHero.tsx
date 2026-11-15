// Top of a case-study page: back link, title (the page's only h1), pills, summary, Live link / source code.
import Link from "next/link";
import { pick, localePath } from "@/lib/i18n";
import type { Lang } from "@/lib/content/types";
import ProjectLinks from "../ProjectLinks";
import { categoryLabel, statusLabel } from "../ProjectBand";
import styles from "../work.module.css";
import { accentVar, cssVars, cx } from "../utils";
import type { Messages, ProjectView } from "../types";

export default function CaseHero({ project, lang, m }: { project: ProjectView; lang: Lang; m: Messages }) {
  const summary = pick(project, "summary", lang);
  return (
    <header className={styles.caseHero} style={cssVars({ "--accent": accentVar(project.accent) })}>
      <Link href={`${localePath(lang)}#projects`} className={styles.backLink}>
        <svg className={styles.icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false">
          <path d="M10 3 5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {m.back}
      </Link>
      <h1 className={cx("font-display mt-6 text-[clamp(2.25rem,8vw,4.5rem)] leading-[1.02] tracking-tight text-text")}>{project.title}</h1>
      <ul className={cx(styles.pills, "mt-5")}>
        <li className={styles.pill}>{categoryLabel(project.category, m)}</li>
        <li className={cx(styles.pill, styles.pillAccent)}>
          <span className={styles.dot} aria-hidden="true" />
          {statusLabel(project.status, m)}
        </li>
      </ul>
      {summary && <p className="font-body mt-6 max-w-[62ch] text-lg leading-relaxed text-text">{summary}</p>}
      <div className="mt-6">
        <ProjectLinks title={project.title} slug={project.slug} liveUrl={project.live_url} repoUrl={project.repo_url} lang={lang} m={m} />
      </div>
    </header>
  );
}
