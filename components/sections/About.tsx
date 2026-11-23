import SparkAnchor from "@/components/sparks/SparkAnchor";
import type { Lang } from "@/lib/content/types";
import { getProfile, getSiteSettings } from "@/lib/content";
import { getMessages, pick } from "@/lib/i18n";
import Image from "next/image";
import { mediaUrl } from "@/lib/media";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Morph } from "@/components/layout/Morph";
import { paragraphs, tr } from "@/components/layout/messages";

/** Section #about: bio from the profile table, facts as a plain definition list (no skill bars). */
export default async function About({ lang }: { lang: Lang }) {
  const [profile, settings, m] = await Promise.all([getProfile(), getSiteSettings(), getMessages(lang, ["about", "common"])]);
  const a = m.about;
  const newTab = tr(m.common, "newTab");

  const bio = (profile ? pick(profile, "bio", lang) : "") || tr(a, "bio");
  // The bio may end with a **bold** tagline (Markdown stars). Show the tagline as a signature line, never as literal stars.
  const all = paragraphs(bio);
  const last = all[all.length - 1] ?? "";
  const hasTag = all.length > 1 && /^\*\*[^*]+\*\*$/.test(last);
  const body = (hasTag ? all.slice(0, -1) : all).map((p) => p.replace(/\*\*(.+?)\*\*/g, "$1"));
  const bioParts = { lead: body.slice(0, 2), more: body.slice(2), tagline: hasTag ? last.replace(/\*\*/g, "") : "" };
  const github = settings.github_url?.trim() || "https://github.com/AbdullahKhan369";
  const linkedin = settings.linkedin_url?.trim();
  const email = settings.email?.trim();

  const photo = mediaUrl(profile?.photo_url) ?? "/abdullah.webp";

  const facts: { key: string; term: string; value: string }[] = [
    { key: "based", term: tr(a, "basedTerm"), value: tr(a, "basedValue") },
    { key: "roles", term: tr(a, "rolesTerm"), value: tr(a, "rolesValue") },
    { key: "worked", term: tr(a, "workedTerm"), value: tr(a, "workedValue") },
    { key: "build", term: tr(a, "buildTerm"), value: tr(a, "buildValue") },
    { key: "ads", term: tr(a, "adsTerm"), value: tr(a, "adsValue") },
    { key: "create", term: tr(a, "createTerm"), value: tr(a, "createValue") },
    { key: "studied", term: tr(a, "studiedTerm"), value: tr(a, "studiedValue") },
    { key: "handle", term: tr(a, "handleTerm"), value: tr(a, "handleValue") },
  ];

  return (
    <section id="about" className="pa-section" style={{ position: "relative" }} aria-labelledby="pa-about-h">
      <div className="pa-wrap pa-about">
        <div className="pa-about-lead">
          <figure className="pa-about-photo">
            <span className="pa-about-ring" aria-hidden="true" />
            <Image src={photo} alt={tr(m.about, "photoAlt", { name: profile?.name?.trim() || "Abdullah Khan" })} width={900} height={900} sizes="(min-width: 1024px) 22rem, 70vw" className="pa-about-img" />
          </figure>
          <h2 id="pa-about-h" className="pa-h2">
            <Morph id="about.title" text={tr(a, "title")} />
          </h2>
          {bioParts.lead.map((p, i) => (
            <p key={i} className="pa-body">
              <Morph id={`about.bio.${i}`} text={p} />
            </p>
          ))}
          {bioParts.more.length > 0 ? (
            <details className="pa-more">
              <summary>
                <span className="pa-more-open">{tr(a, "readMore")}</span>
                <span className="pa-more-close">{tr(a, "readLess")}</span>
              </summary>
              {bioParts.more.map((p, i) => (
                <p key={i} className="pa-body">
                  <Morph id={`about.bio.${i + bioParts.lead.length}`} text={p} />
                </p>
              ))}
            </details>
          ) : null}
          {bioParts.tagline ? <p className="pa-about-tag">{bioParts.tagline}</p> : null}
          <ul className="pa-about-links">
            <li>
              <ExternalLink href={github} newTabLabel={newTab} className="pa-textlink">
                {tr(m.common, "github")}
              </ExternalLink>
            </li>
            {linkedin ? (
              <li>
                <ExternalLink href={linkedin} newTabLabel={newTab} className="pa-textlink">
                  {tr(m.common, "linkedin")}
                </ExternalLink>
              </li>
            ) : null}
            {email ? (
              <li>
                <a className="pa-textlink" href={`mailto:${email}`}>
                  {email}
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <dl className="pa-facts">
          {facts.map((f) => (
            <div key={f.key} className="pa-fact">
              <dt>
                <Morph id={`about.t.${f.key}`} text={f.term} />
              </dt>
              <dd>
                <Morph id={`about.v.${f.key}`} text={f.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <SparkAnchor n={9} />
    </section>
  );
}
