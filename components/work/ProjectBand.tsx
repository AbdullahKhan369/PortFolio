// One full-width band for a tier-1 project: copy on one side, laptop + phone on the other.
import { pick } from "@/lib/i18n";
import Image from "next/image";
import { mediaUrl } from "@/lib/media";
import type { Lang, MarketingCampaign } from "@/lib/content/types";
import DeviceScene from "./DeviceScene";
import MetricList from "./MetricList";
import ProjectLinks from "./ProjectLinks";
import { pickShots } from "./media";
import styles from "./work.module.css";
import { accentVar, cssVars, cx, fill } from "./utils";
import type { Messages, ProjectView } from "./types";

export function categoryLabel(category: string, m: Messages): string {
  return m[`category_${category.replace(/-/g, "_")}`] ?? category;
}
export function statusLabel(status: string, m: Messages): string {
  return m[`status_${status.replace(/-/g, "_")}`] ?? status;
}

interface Props {
  project: ProjectView;
  lang: Lang;
  m: Messages;
  index: number;
  total: number;
  priority?: boolean;
  campaigns?: MarketingCampaign[];
}

const PLATFORM: Record<string, string> = { meta: "Meta", tiktok: "TikTok", google: "Google", linkedin: "LinkedIn", other: "Other" };

export default function ProjectBand({ project, lang, m, index, total, priority, campaigns = [] }: Props) {
  const role = pick(project, "role", lang);
  const summary = pick(project, "summary", lang);
  const { desktop, mobile } = pickShots(project, lang, m);
  const headingId = `project-${project.slug}`;
  const live = project.live_url?.trim() || null;
  const thumbs = (project.media ?? []).filter((x) => x.kind !== "video").slice(0, 4);

  return (
    <article className={styles.band} style={cssVars({ "--accent": accentVar(project.accent) })} aria-labelledby={headingId}>
      <div className={styles.bandInner}>
        <div className={styles.copy}>
          <p className="sr-only">{fill(m.position, { n: index + 1, total })}</p>
          <h3 id={headingId} className={cx(styles.title, "font-display")}>
            {project.title}
          </h3>
          <ul className={styles.pills}>
            <li className={styles.pill}>{categoryLabel(project.category, m)}</li>
            <li className={cx(styles.pill, styles.pillAccent)}>
              <span className={styles.dot} aria-hidden="true" />
              {statusLabel(project.status, m)}
            </li>
          </ul>
          {summary && <p className={cx(styles.summary, "font-body")}>{summary}</p>}
          <div className="pa-lens-dev">
          <dl className={styles.facts}>
            {role && (
              <div className={styles.fact}>
                <dt>{m.role_label}</dt>
                <dd className="font-body">{role}</dd>
              </div>
            )}
            {project.stack?.length > 0 && (
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
          </div>
          {campaigns.length > 0 && (
            <div className="pa-lens-ads">
              <p className="pa-lens-title">{m.lens_ads_title}</p>
              <ul className="pa-lens-list">
                {campaigns.map((c) => (
                  <li key={c.id}>
                    <strong>{PLATFORM[c.platform] ?? c.platform}</strong>
                    <span>{pick(c, "objective", lang) || c.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {thumbs.length > 0 && (
            <div className="pa-lens-creative">
              <p className="pa-lens-title">{m.lens_creative_title}</p>
              <ul className="pa-lens-thumbs">
                {thumbs.map((t) => {
                  const src = mediaUrl(t.url);
                  return src ? (
                    <li key={t.id} className="pa-lens-thumb">
                      <Image src={src} alt={pick(t, "caption", lang) || project.title} fill sizes="(min-width: 1024px) 12vw, 40vw" />
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          )}
          <MetricList metrics={project.metrics} lang={lang} label={m.results_label} />
          <ProjectLinks
            title={project.title}
            slug={project.slug}
            liveUrl={project.live_url}
            repoUrl={project.repo_url}
            lang={lang}
            m={m}
            caseStudy
          />
        </div>
        <DeviceScene
          desktop={desktop}
          mobile={mobile}
          pendingLabel={m.screenshot_pending}
          priority={priority}
          liveUrl={live}
          liveTitle={project.title}
          liveLabels={{ explore: m.live_explore ?? "", done: m.live_done ?? "", badge: m.live_badge ?? "" }}
        />
      </div>
    </article>
  );
}
