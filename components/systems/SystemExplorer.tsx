"use client";
// Tabs (one per system) + graph + detail panel + a plain-list alternative of the same flow.
import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { usePerformanceTier, usePrefersReducedMotion } from "@/lib/device";
import NodeDetail from "./NodeDetail";
import SystemGraph, { KindGlyph } from "./SystemGraph";
import { KIND_ORDER, type NodeKind, type SystemView } from "./types";
import styles from "./systems.module.css";
import { cx, fill } from "@/components/work/utils";

export default function SystemExplorer({ systems, m }: { systems: SystemView[]; m: Record<string, string> }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const tier = usePerformanceTier();
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const system = systems[Math.min(active, systems.length - 1)];
  const kindLabels = useMemo(() => {
    const o = {} as Record<NodeKind, string>;
    for (const k of KIND_ORDER) o[k] = m[`kind_${k}`] ?? k;
    return o;
  }, [m]);

  const presentKinds = useMemo(() => KIND_ORDER.filter((k) => system.nodes.some((n) => n.kind === k)), [system]);
  const node = system.nodes.find((n) => n.key === selected) ?? null;
  const labelOf = (key: string) => system.nodes.find((n) => n.key === key)?.label ?? key;

  const choose = (i: number) => {
    setActive(i);
    setSelected(null);
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = systems.length - 1;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = i === last ? 0 : i + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = i === 0 ? last : i - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next < 0) return;
    e.preventDefault();
    choose(next);
    document.getElementById(`${uid}-tab-${next}`)?.focus();
  };

  return (
    <div>
      {systems.length > 1 && (
        <div role="tablist" aria-label={m.tabs_label} className={styles.tabs}>
          {systems.map((s, i) => (
            <button
              key={s.slug}
              id={`${uid}-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-controls={`${uid}-panel`}
              tabIndex={i === active ? 0 : -1}
              className={styles.tab}
              onClick={() => choose(i)}
              onKeyDown={(e) => onTabKey(e, i)}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      <div id={`${uid}-panel`} role={systems.length > 1 ? "tabpanel" : undefined} aria-labelledby={systems.length > 1 ? `${uid}-tab-${active}` : undefined}>
        {system.description && <p className="font-body mb-5 max-w-[62ch] text-lg leading-relaxed text-text">{system.description}</p>}

        <div className={styles.layout}>
          <div className="min-w-0">
            <SystemGraph
              nodes={system.nodes}
              edges={system.edges}
              selected={selected}
              onSelect={setSelected}
              mapLabel={fill(m.map_label, { title: system.title })}
              kindLabels={kindLabels}
              selectedLabel={m.selected}
              animate={tier === "high" && !reduced}
            />

            {presentKinds.length > 0 && (
              <ul className={styles.legend} aria-label={m.legend_label}>
                {presentKinds.map((k) => (
                  <li key={k}>
                    <KindGlyph kind={k} size={22} />
                    {kindLabels[k]}
                  </li>
                ))}
              </ul>
            )}

            <details className={styles.listBox}>
              <summary>{m.list_toggle}</summary>
              {system.edges.length === 0 ? (
                <p className={cx(styles.muted, "mt-2")}>{m.list_empty}</p>
              ) : (
                <ol className={cx(styles.flowList, "font-body")}>
                  {system.edges.map((e, i) => (
                    <li key={`${e.from}-${e.to}-${i}`}>
                      {e.label
                        ? fill(m.list_item_label, { from: labelOf(e.from), to: labelOf(e.to), label: e.label })
                        : fill(m.list_item, { from: labelOf(e.from), to: labelOf(e.to) })}
                    </li>
                  ))}
                </ol>
              )}
            </details>
          </div>

          <div aria-live="polite">
            <NodeDetail node={node} nodes={system.nodes} edges={system.edges} m={m} kindLabels={kindLabels} onSelect={setSelected} />
          </div>
        </div>
      </div>
    </div>
  );
}
