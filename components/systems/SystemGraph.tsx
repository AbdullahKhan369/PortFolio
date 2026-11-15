"use client";
// Interactive SVG graph. Works in real pixels (it measures its container) so text stays a readable size on a
// 320px phone and every node has a 44px+ hit target. Nodes are keyboard focusable buttons.
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { EdgeView, NodeKind, NodeView } from "./types";
import { edgeEnds, fitNodes, planLabel, toPixels, wrapLabel, type Pt } from "./layout";
import { clamp, cx } from "@/components/work/utils";
import styles from "./systems.module.css";

const R = 20;

/** The shape that identifies a kind. Used on the map, in the legend and in the detail panel. */
export function KindGlyph({ kind, size = 24 }: { kind: NodeKind; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-14 -14 28 28" aria-hidden="true" focusable="false" className={styles.node} data-kind={kind} style={{ cursor: "default" }}>
      <ShapeBody kind={kind} r={10} />
    </svg>
  );
}

function ShapeBody({ kind, r }: { kind: NodeKind; r: number }) {
  switch (kind) {
    case "db":
      return (
        <>
          <rect className={cx(styles.shape, styles.fillTint)} x={-r * 1.1} y={-r * 0.85} width={r * 2.2} height={r * 1.7} rx={r * 0.35} />
          <path className={styles.mark} d={`M${-r * 1.1} ${-r * 0.2}H${r * 1.1}`} />
        </>
      );
    case "queue":
      return (
        <>
          <rect className={cx(styles.shape, styles.fillTint)} x={-r * 1.3} y={-r * 0.72} width={r * 2.6} height={r * 1.44} rx={r * 0.72} />
          <path className={styles.mark} d={`M${-r * 0.5} ${-r * 0.3}V${r * 0.3}M0 ${-r * 0.3}V${r * 0.3}M${r * 0.5} ${-r * 0.3}V${r * 0.3}`} />
        </>
      );
    case "api": {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i + Math.PI / 6;
        return `${(Math.cos(a) * r * 1.1).toFixed(2)},${(Math.sin(a) * r * 1.1).toFixed(2)}`;
      }).join(" ");
      return <polygon className={cx(styles.shape, styles.fillTint)} points={pts} strokeLinejoin="round" />;
    }
    case "ai":
      return (
        <>
          <polygon className={cx(styles.shape, styles.fillTint)} points={`0,${-r * 1.2} ${r * 1.2},0 0,${r * 1.2} ${-r * 1.2},0`} strokeLinejoin="round" />
          <text className={styles.aiText} textAnchor="middle" dominantBaseline="central" y={0.5}>
            AI
          </text>
        </>
      );
    case "client":
      return (
        <>
          <circle className={cx(styles.shape, styles.fillTint)} r={r} />
          <circle className={styles.mark} r={r * 0.4} />
        </>
      );
    case "other":
      return <circle className={cx(styles.shape, styles.fillTint)} r={r} strokeDasharray="4 3" />;
    default:
      return <circle className={cx(styles.shape, styles.fillTint)} r={r} />;
  }
}

interface Props {
  nodes: NodeView[];
  edges: EdgeView[];
  selected: string | null;
  onSelect: (key: string) => void;
  mapLabel: string;
  kindLabels: Record<NodeKind, string>;
  selectedLabel: string;
  animate: boolean;
}

export default function SystemGraph({ nodes, edges, selected, onSelect, mapLabel, kindLabels, selectedLabel, animate }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(360);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const read = () => setW(Math.max(280, Math.floor(el.getBoundingClientRect().width)));
    read();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", read);
      return () => window.removeEventListener("resize", read);
    }
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const narrow = w < 520;
  const h = narrow ? 540 : Math.round(clamp(w * 0.5, 380, 540));
  const padX = narrow ? 48 : 70;
  const padY = narrow ? 44 : 52;
  const wrapAt = narrow ? 13 : 20;

  const placed = useMemo(() => {
    // Fit to the nodes' own box; on phones the flow runs top to bottom instead of left to right.
    const fitted = fitNodes(nodes, narrow);
    const map = new Map<string, Pt>();
    for (const n of nodes) {
      const f = fitted.get(n.key) ?? { x: 50, y: 50 };
      map.set(n.key, toPixels(f.x, f.y, w, h, padX, padY));
    }
    return map;
  }, [nodes, w, h, padX, padY, narrow]);

  const activeEdge = (e: EdgeView) => selected !== null && (e.from === selected || e.to === selected);

  return (
    <div ref={wrapRef} className={styles.graphWrap}>
      <svg className={styles.svg} width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="group" aria-label={mapLabel}>
        <defs>
          <marker id={`${uid}-a`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path className={styles.arrow} d="M0 1 10 5 0 9z" />
          </marker>
          <marker id={`${uid}-b`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path className={styles.arrowOn} d="M0 1 10 5 0 9z" />
          </marker>
        </defs>

        <g aria-hidden="true">
          {edges.map((e, i) => {
            const a = placed.get(e.from);
            const b = placed.get(e.to);
            if (!a || !b) return null;
            const on = activeEdge(e);
            const { from, to, len } = edgeEnds(a, b, R, R);
            if (len === 0) return null;
            const lines = e.label ? wrapLabel(e.label, 16, 2) : [];
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;
            return (
              <g key={`${e.from}-${e.to}-${i}`}>
                <line
                  className={cx(styles.edge, on && styles.edgeOn, on && animate && styles.flow)}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  markerEnd={`url(#${uid}-${on ? "b" : "a"})`}
                />
                {lines.length > 0 && (
                  <text className={styles.edgeLabel} x={clamp(mx, 40, w - 40)} y={my - 6 - (lines.length - 1) * 12} textAnchor="middle">
                    {lines.map((t, li) => (
                      <tspan key={li} x={clamp(mx, 40, w - 40)} dy={li === 0 ? 0 : 12}>
                        {t}
                      </tspan>
                    ))}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        <g>
          {nodes.map((n) => {
            const p = placed.get(n.key);
            if (!p) return null;
            const lines = wrapLabel(n.label, wrapAt, 3);
            const targets: Pt[] = [];
            for (const e of edges) {
              const other = e.from === n.key ? e.to : e.to === n.key ? e.from : null;
              const q = other ? placed.get(other) : undefined;
              if (q) targets.push(q);
            }
            const others = nodes.filter((o) => o.key !== n.key).map((o) => placed.get(o.key)).filter((q): q is Pt => !!q);
            const plan = planLabel(p, targets, others, lines, w, h, R);
            const anchor = plan.anchor;
            const dx = plan.dx;
            const firstY = plan.y;
            const isSel = selected === n.key;
            return (
              <g
                key={n.key}
                className={styles.node}
                data-kind={n.kind}
                transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}
                role="button"
                tabIndex={0}
                aria-pressed={isSel}
                aria-label={`${n.label}, ${kindLabels[n.kind] ?? n.kind}${isSel ? `, ${selectedLabel}` : ""}`}
                onClick={() => onSelect(n.key)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    onSelect(n.key);
                  }
                }}
              >
                <circle className={styles.hit} r={24} />
                <circle className={styles.ring} r={R + 8} />
                <ShapeBody kind={n.kind} r={R} />
                <text className={styles.label} textAnchor={anchor} x={dx} y={firstY}>
                  {lines.map((t, li) => (
                    <tspan key={li} x={dx} dy={li === 0 ? 0 : 14}>
                      {t}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
