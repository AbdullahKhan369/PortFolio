"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePerformanceTier } from "@/lib/device";
import { hasValue } from "@/lib/content/visible";
import { useScrollLinked } from "@/lib/motion";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Morph } from "@/components/layout/Morph";
import { ProofScan } from "./ProofScan";

export interface TimelineItem {
  id: string;
  title: string;
  description: string | null;
  year: number | null;
  kind: "course" | "certificate" | "result" | "work" | "other";
  kindLabel: string;
  imageUrl: string | null;
  proofUrl: string | null;
  /** Calm treatment (no glow, no accent colour): used for the Hafiz-e-Quran milestone. */
  quiet: boolean;
}

export interface TimelineLabels {
  viewProof: string;
  scanPlaceholder: string;
  openScan: string;
  scanAlt: string;
  newTab: string;
}

/**
 * A comet travels down the line as you scroll and lights each real milestone.
 * Native scroll only; the shared scroll engine reports progress and we write transforms directly.
 * Low-end / reduced motion / no JS: every milestone is simply lit (CSS), no comet.
 */
export function CometTimeline({ items, labels }: { items: TimelineItem[]; labels: TimelineLabels }) {
  const live = usePerformanceTier() === "high";
  const tlRef = useRef<HTMLDivElement>(null);
  const cometRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const liRefs = useRef<(HTMLLIElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const dots = useRef<number[]>([]);
  const height = useRef(1);
  const lastP = useRef(0);
  const lit = useRef<boolean[]>([]);

  const apply = useCallback((p: number): void => {
    lastP.current = p;
    const pos = dots.current;
    if (pos.length === 0) return;
    const first = pos[0] ?? 0;
    const last = pos[pos.length - 1] ?? first;
    const y = first + p * (last - first);
    if (cometRef.current) cometRef.current.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    if (fillRef.current) fillRef.current.style.clipPath = `inset(0 0 ${Math.max(0, height.current - y).toFixed(1)}px 0)`;
    pos.forEach((dy, i) => {
      const on = y >= dy - 1;
      if (lit.current[i] !== on) {
        lit.current[i] = on;
        liRefs.current[i]?.setAttribute("data-lit", on ? "true" : "false");
      }
    });
  }, []);

  const measure = useCallback((): void => {
    const tl = tlRef.current;
    if (!tl) return;
    const box = tl.getBoundingClientRect();
    height.current = box.height || 1;
    dots.current = dotRefs.current.map((d) => {
      if (!d) return 0;
      const r = d.getBoundingClientRect();
      return r.top + r.height / 2 - box.top;
    });
    apply(lastP.current);
  }, [apply]);

  useEffect(() => {
    if (!live) return;
    measure();
    const tl = tlRef.current;
    if (!tl || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(tl);
    window.addEventListener("load", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", measure);
    };
  }, [live, measure, items.length]);

  useScrollLinked(tlRef, apply, { enter: 0.72, exit: 0.45, enabled: live });

  return (
    <div ref={tlRef} className="pa-tl">
      <span className="pa-tl-line" aria-hidden="true">
        <span ref={fillRef} className="pa-tl-fill" />
      </span>
      <span ref={cometRef} className="pa-comet" aria-hidden="true" />
      <ol className="pa-tl-list">
        {items.map((item, i) => (
          <li
            key={item.id}
            ref={(el) => {
              liRefs.current[i] = el;
            }}
            className="pa-ms"
            data-lit="false"
            data-kind={item.kind}
            data-quiet={item.quiet ? "true" : "false"}
          >
            <span
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              className="pa-ms-dot"
              aria-hidden="true"
            />
            {hasValue(item.year) ? <p className="pa-ms-year">{item.year}</p> : null}
            <div className="pa-ms-body">
              <p className="pa-ms-kind">{item.kindLabel}</p>
              <h3 className="pa-ms-title">{item.title}</h3>
              {item.description ? <p className="pa-ms-text">{item.description}</p> : null}

              {item.imageUrl ? (
                <ProofScan
                  src={item.imageUrl}
                  title={item.title}
                  alt={labels.scanAlt.split("{title}").join(item.title)}
                  openLabel={`${labels.openScan}: ${item.title}`}
                />
              ) : item.kind === "certificate" ? (
                <p className="pa-scan-ph">
                  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
                    <rect x="3.5" y="5" width="17" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M7 9h10M7 12.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M9 17l-1 3.5 4-1.8 4 1.8-1-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                  <Morph id={`ach.ph.${item.id}`} text={labels.scanPlaceholder} />
                </p>
              ) : null}

              {item.proofUrl ? (
                <p className="pa-ms-proof">
                  <ExternalLink href={item.proofUrl} newTabLabel={labels.newTab} className="pa-textlink">
                    {labels.viewProof}
                  </ExternalLink>
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
