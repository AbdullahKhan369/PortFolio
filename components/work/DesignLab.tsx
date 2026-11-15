// Tier-2 projects: compact rows (no identical cards). Each row keeps its accent bar, summary, stack and links.
import { pick } from "@/lib/i18n";
import type { Lang } from "@/lib/content/types";
import ProjectLinks from "./ProjectLinks";
import styles from "./work.module.css";
import { accentVar, cssVars, cx } from "./utils";
import type { Messages, ProjectView } from "./types";
import { categoryLabel } from "./ProjectBand";

export default function DesignLab({ projects, lang, m }: { projects: ProjectView[]; lang: Lang; m: Messages }) {
  if (projects.length === 0) return null;
  return (
    <div>
      <h3 className="font-display text-[clamp(1.5rem,4vw,2.25rem)] leading-tight">{m.lab_heading}</h3>
      <p className="font-body mt-2 max-w-[60ch] text-muted">{m.lab_intro}</p>
      <ul className={cx(styles.labList, "mt-8")}>
        {projects.map((p) => {
          const summary = pick(p, "summary", lang);
          return (
            <li key={p.id} className={styles.labRow} style={cssVars({ "--accent": accentVar(p.accent) })}>
              <div>
                <h4 className={cx(styles.labTitle, "font-display")}>{p.title}</h4>
                <p className="font-body mt-1 text-sm text-muted">{categoryLabel(p.category, m)}</p>
              </div>
              <div className="grid gap-3">
                {summary && <p className={cx(styles.labSummary, "font-body")}>{summary}</p>}
                {p.stack?.length > 0 && (
                  <ul className={styles.tags}>
                    {p.stack.map((s) => (
                      <li className={styles.tag} key={s}>
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <ProjectLinks title={p.title} slug={p.slug} liveUrl={p.live_url} repoUrl={p.repo_url} lang={lang} m={m} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
