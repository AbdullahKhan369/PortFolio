// Home section "projects" (anchor id: projects). Server component per contract 5.2.
import { getCampaigns, getProjects } from "@/lib/content";
import { getMessages } from "@/lib/i18n";
import type { Lang } from "@/lib/content/types";
import LensBar from "@/components/work/LensBar";
import DesignLab from "@/components/work/DesignLab";
import DeviceStack from "@/components/work/DeviceStack";
import ProjectBand from "@/components/work/ProjectBand";
import type { ProjectView } from "@/components/work/types";

export default async function Projects({ lang }: { lang: Lang }) {
  const [projects, campaigns, messages] = await Promise.all([getProjects(), getCampaigns(), getMessages(lang, ["projects"])]);
  const m = messages.projects ?? {};

  const list = projects as ProjectView[];
  const featured = list.filter((p) => p.tier === 1);
  const lab = list.filter((p) => p.tier === 2);
  const hasAds = featured.some((p) => campaigns.some((c) => c.project_id === p.id));
  const hasCreative = featured.some((p) => (p.media ?? []).some((x) => x.kind !== "video"));
  const empty = featured.length === 0 && lab.length === 0;

  return (
    <section id="projects" style={{ position: "relative" }} aria-labelledby="projects-title" className="px-5 py-20 md:px-10 md:py-28 lg:px-16">
      <div className="mx-auto w-full max-w-[1280px]">
        <header className="mb-10 max-w-3xl md:mb-14">
          <h2 id="projects-title" className="font-display text-[clamp(2rem,6vw,3.75rem)] leading-[1.04] tracking-tight text-text">
            {m.heading}
          </h2>
          <p className="font-body mt-4 max-w-[62ch] text-lg leading-relaxed text-muted">{m.intro}</p>
          <LensBar ads={hasAds} creative={hasCreative} labels={{ aria: m.lens_aria, dev: m.lens_dev, ads: m.lens_ads, creative: m.lens_creative }} />
        </header>

        {empty && <p className="font-body text-muted">{m.empty}</p>}

        {featured.length > 0 && (
          <DeviceStack
            label={m.stack_aria}
            items={featured.map((p, i) => ({
              id: p.id,
              node: <ProjectBand project={p} lang={lang} m={m} index={i} total={featured.length} campaigns={campaigns.filter((c) => c.project_id === p.id)} />,
            }))}
          />
        )}

        {lab.length > 0 && (
          <div className="mt-20 md:mt-28">
            <DesignLab projects={lab} lang={lang} m={m} />
          </div>
        )}
      </div>
    </section>
  );
}
