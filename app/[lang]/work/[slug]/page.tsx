// Case-study page: /[lang]/work/[slug]. Built only from real project data (summary, role, stack, metrics, media,
// optional story/highlights, linked campaigns). Every external link goes through ExternalLink (new tab).
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCampaigns, getProjectBySlug, getProjects } from "@/lib/content";
import { getMessages, pick } from "@/lib/i18n";
import { mediaUrl } from "@/lib/media";
import CaseCampaigns from "@/components/work/case-study/CaseCampaigns";
import CaseFacts from "@/components/work/case-study/CaseFacts";
import CaseGallery from "@/components/work/case-study/CaseGallery";
import CaseHero from "@/components/work/case-study/CaseHero";
import CaseNav from "@/components/work/case-study/CaseNav";
import { highlightsOf, storyOf, type ProjectView } from "@/components/work/types";
import { isLang } from "@/components/work/utils";
import styles from "@/components/work/work.module.css";
import { accentVar, cssVars, cx } from "@/components/work/utils";

type Params = Promise<{ lang: string; slug: string }>;

export const dynamicParams = true;

export async function generateStaticParams() {
  const projects = await getProjects();
  return (["en", "ur"] as const).flatMap((lang) => projects.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  // S4's buildMetadata: canonical, hreflang (en / ur-Latn), Open Graph and Twitter, same as every other page.
  return buildMetadata({
    lang,
    path: `/work/${slug}`,
    title: project.title,
    description: pick(project, "summary", lang).slice(0, 160),
    image: mediaUrl(project.cover_url),
    type: "article",
  });
}

export default async function CaseStudyPage({ params }: { params: Params }) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();

  const found = await getProjectBySlug(slug);
  if (!found) notFound();
  const project = found as ProjectView;

  const [all, campaigns, messages] = await Promise.all([getProjects(), getCampaigns(), getMessages(lang, ["projects", "marketing"])]);
  const m = messages.projects ?? {};
  const mk = messages.marketing ?? {};

  const featured = (all as ProjectView[]).filter((p) => p.tier === 1);
  const idx = featured.findIndex((p) => p.id === project.id);
  const prev = idx > 0 ? featured[idx - 1] : null;
  const next = idx >= 0 && idx < featured.length - 1 ? featured[idx + 1] : null;
  const linked = campaigns.filter((c) => c.project_id === project.id);

  const story = storyOf(project, lang);
  const paragraphs = story ? story.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean) : [];
  const highlights = highlightsOf(project, lang);
  const hasStory = paragraphs.length > 0 || highlights.length > 0;

  return (
    <article className="px-5 py-10 md:px-10 md:py-16 lg:px-16" style={cssVars({ "--accent": accentVar(project.accent) })}>
      <div className="mx-auto grid w-full max-w-[1280px] gap-16 md:gap-20">
        <CaseHero project={project} lang={lang} m={m} />

        <div className={hasStory ? styles.caseGrid : undefined}>
          {hasStory && (
            <div className="grid gap-10">
              {paragraphs.length > 0 && (
                <section aria-labelledby="case-story-title">
                  <h2 id="case-story-title" className={cx(styles.caseSectionTitle, "font-display")}>
                    {m.case_story}
                  </h2>
                  <div className={cx(styles.prose, "font-body")}>
                    {paragraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </section>
              )}
              {highlights.length > 0 && (
                <section aria-labelledby="case-highlights-title">
                  <h2 id="case-highlights-title" className={cx(styles.caseSectionTitle, "font-display")}>
                    {m.case_highlights}
                  </h2>
                  <ul className={cx(styles.highlights, "font-body")}>
                    {highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
          <CaseFacts project={project} lang={lang} m={m} />
        </div>

        <CaseGallery project={project} lang={lang} m={m} />
        <CaseCampaigns campaigns={linked} lang={lang} m={m} mk={mk} />
        <CaseNav prev={prev} next={next} lang={lang} m={m} />
      </div>
    </article>
  );
}
