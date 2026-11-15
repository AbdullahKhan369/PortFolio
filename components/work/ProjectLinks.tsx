// Live link / source code / case study buttons. Every external link goes through the shared ExternalLink
// (target=_blank, rel=noopener noreferrer, hidden "opens in a new tab" text) as required by the contract.
import Link from "next/link";
import { ExternalLink } from "@/components/ui";
import { localePath } from "@/lib/i18n";
import type { Lang } from "@/lib/content/types";
import styles from "./work.module.css";
import { cx, fill, safeUrl } from "./utils";
import type { Messages } from "./types";

function OutIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false">
      <path d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10" strokeLinecap="round" />
      <path d="M9 2h5v5M14 2 7.5 8.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface Props {
  title: string;
  slug: string;
  liveUrl: string | null;
  repoUrl: string | null;
  lang: Lang;
  m: Messages;
  /** Show the "Read the case study" link (tier 1 band only). */
  caseStudy?: boolean;
}

export default function ProjectLinks({ title, slug, liveUrl, repoUrl, lang, m, caseStudy }: Props) {
  const live = safeUrl(liveUrl);
  const repo = safeUrl(repoUrl);
  if (!live && !repo && !caseStudy) return null;
  return (
    <div className={styles.links}>
      {live && (
        <ExternalLink href={live} newTabLabel={m.new_tab} className={cx(styles.btn, styles.btnPrimary)}>
          <span>{m.live_link}</span>
          <span className="sr-only"> {fill(m.live_for, { title })}</span>
          <OutIcon />
        </ExternalLink>
      )}
      {repo && (
        <ExternalLink href={repo} newTabLabel={m.new_tab} className={cx(styles.btn, styles.btnGhost)}>
          <span>{m.repo_link}</span>
          <span className="sr-only"> {fill(m.repo_for, { title })}</span>
          <OutIcon />
        </ExternalLink>
      )}
      {caseStudy && (
        <Link href={localePath(lang, `/work/${slug}`)} className={styles.btnText}>
          <span>{m.case_study}</span>
          <span className="sr-only"> {fill(m.case_study_for, { title })}</span>
        </Link>
      )}
    </div>
  );
}
