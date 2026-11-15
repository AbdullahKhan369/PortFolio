// Role, stack and results for the case-study sidebar. Results come from admin metrics; empty ones are hidden.
import { pick } from "@/lib/i18n";
import type { Lang } from "@/lib/content/types";
import MetricList from "../MetricList";
import styles from "../work.module.css";
import { accentVar, cssVars, cx } from "../utils";
import type { Messages, ProjectView } from "../types";

export default function CaseFacts({ project, lang, m }: { project: ProjectView; lang: Lang; m: Messages }) {
  const role = pick(project, "role", lang);
  const hasStack = (project.stack?.length ?? 0) > 0;
  const hasMetrics = (project.metrics ?? []).some((x) => x?.value && String(x.value).trim());
  if (!role && !hasStack && !hasMetrics) return null;
  return (
    <aside aria-labelledby="case-details-title" style={cssVars({ "--accent": accentVar(project.accent) })} className="grid gap-6 self-start bg-surface p-6 md:p-8">
      <h2 id="case-details-title" className={cx(styles.caseSectionTitle, "font-display !mb-0")}>
        {m.case_details}
      </h2>
      <dl className={styles.facts}>
        {role && (
          <div className={styles.fact}>
            <dt>{m.role_label}</dt>
            <dd className="font-body">{role}</dd>
          </div>
        )}
        {hasStack && (
          <div className={styles.fact}>
            <dt>{m.stack_label}</dt>
            <dd>
              <ul className={styles.tags}>
                {project.stack.map((s) => (
                  <li className={styles.tag} key={s}>
                    {s}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
      <MetricList metrics={project.metrics} lang={lang} label={m.results_label} />
    </aside>
  );
}
