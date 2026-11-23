import type { Lang } from "@/lib/content/types";
import { getCampaigns, getProjects, getSystems } from "@/lib/content";
import { getMessages } from "@/lib/i18n";
import { tr } from "@/components/layout/messages";
import { CountUp } from "./CountUp";

/**
 * Proof from the site's own data. Every number is counted from the rows listed further down the page
 * (projects, campaigns, systems), so it can never be invented and it stays true when you add or remove work in Admin.
 * A stat with a count of 0 is left out; fewer than two stats means the strip is not shown at all.
 */
export default async function ProofStrip({ lang }: { lang: Lang }) {
  const [projects, campaigns, systems, m] = await Promise.all([getProjects(), getCampaigns(), getSystems(), getMessages(lang, ["hero"])]);
  const h = m.hero;

  const stats = [
    { key: "live", n: projects.filter((p) => p.status === "live" && !!p.live_url).length, label: tr(h, "proofLive") },
    { key: "projects", n: projects.length, label: tr(h, "proofProjects") },
    { key: "campaigns", n: campaigns.length, label: tr(h, "proofCampaigns") },
    { key: "systems", n: systems.length, label: tr(h, "proofSystems") },
  ].filter((s) => s.n > 0);

  if (stats.length < 2) return null;

  return (
    <div className="pa-proof" role="group" aria-label={tr(h, "proofAria")}>
      <dl className="pa-proof-grid">
        {stats.map((s) => (
          <div key={s.key} className="pa-proof-item">
            <dt>{s.label}</dt>
            <dd>
              <CountUp to={s.n} />
            </dd>
          </div>
        ))}
      </dl>
      <p className="pa-proof-note">{tr(h, "proofNote")}</p>
    </div>
  );
}
