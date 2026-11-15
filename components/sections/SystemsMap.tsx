// Home section "systems" (anchor id: systems). Data (systems, nodes, edges) comes from admin.
// Nothing is hard-coded: an AI node appears only if a node of kind "ai" exists in the data.
import SparkAnchor from "@/components/sparks/SparkAnchor";
import { getSystems } from "@/lib/content";
import { getMessages, pick } from "@/lib/i18n";
import type { Lang } from "@/lib/content/types";
import SystemExplorer from "@/components/systems/SystemExplorer";
import type { NodeKind, SystemView } from "@/components/systems/types";

export default async function SystemsMap({ lang }: { lang: Lang }) {
  const [systems, messages] = await Promise.all([getSystems(), getMessages(lang, ["systems"])]);
  const m = messages.systems ?? {};

  const views: SystemView[] = systems
    .map((s) => {
      const nodes = [...s.nodes]
        .sort((a, b) => a.order_index - b.order_index)
        .map((n) => ({
          key: n.key,
          label: pick(n, "label", lang),
          kind: n.kind as NodeKind,
          description: pick(n, "description", lang),
          x: Number(n.x),
          y: Number(n.y),
        }));
      const keys = new Set(nodes.map((n) => n.key));
      // An edge that points at a missing node is dropped instead of crashing the page.
      const edges = [...s.edges]
        .sort((a, b) => a.order_index - b.order_index)
        .filter((e) => keys.has(e.from_key) && keys.has(e.to_key))
        .map((e) => ({ from: e.from_key, to: e.to_key, label: pick(e, "label", lang) }));
      return { slug: s.slug, title: pick(s, "title", lang), description: pick(s, "description", lang), nodes, edges };
    })
    .filter((s) => s.nodes.length > 0);

  return (
    <section id="systems" style={{ position: "relative" }} aria-labelledby="systems-title" className="px-5 py-20 md:px-10 md:py-28 lg:px-16">
      <div className="mx-auto w-full max-w-[1280px]">
        <header className="mb-10 max-w-3xl md:mb-14">
          <h2 id="systems-title" className="font-display text-[clamp(2rem,6vw,3.75rem)] leading-[1.04] tracking-tight text-text">
            {m.heading}
          </h2>
          <p className="font-body mt-4 max-w-[62ch] text-lg leading-relaxed text-muted">{m.intro}</p>
        </header>

        {views.length === 0 ? <p className="font-body text-muted">{m.empty}</p> : <SystemExplorer systems={views} m={m} />}
      </div>
      <SparkAnchor n={6} />
    </section>
  );
}
