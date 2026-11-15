"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/device";
import { prefersReducedMotion } from "@/lib/motion";

export interface PreflightLabels {
  /** "{done} of {total} checked" */
  progress: string;
  skip: string;
  replay: string;
  checked: string;
}

export interface PreflightItem {
  id: string;
  text: string;
}

/**
 * The pre-flight checklist: items tick one by one, then an editable stamp is pressed.
 * Reduced motion: everything is checked at once and the stamp is already there.
 * The progress line is an aria-live region so the ticking is announced politely.
 */
export function PreflightList({ items, stamp, labels }: { items: PreflightItem[]; stamp: string; labels: PreflightLabels }) {
  const total = items.length;
  const hookReduced = usePrefersReducedMotion();
  const reduced = hookReduced || prefersReducedMotion();
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (reduced) setDone(total);
  }, [reduced, total]);

  useEffect(() => {
    if (reduced || done >= total) return;
    const t = window.setTimeout(() => setDone((d) => Math.min(total, d + 1)), done === 0 ? 520 : 740);
    return () => window.clearTimeout(t);
  }, [done, total, reduced]);

  const complete = total > 0 && done >= total;
  const progress = labels.progress.split("{done}").join(String(done)).split("{total}").join(String(total));

  return (
    <div className="pa-pf">
      <ul className="pa-pf-list">
        {items.map((item, i) => {
          const checked = i < done;
          return (
            <li key={item.id} className="pa-pf-row" data-checked={checked ? "true" : "false"}>
              <span className="pa-pf-box" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" focusable="false">
                  <path d="M5 12.5l4.2 4.2L19 7" pathLength={1} fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="pa-pf-text">{item.text}</span>
              {checked ? <span className="pa-sr"> ({labels.checked})</span> : null}
            </li>
          );
        })}
      </ul>

      <p className="pa-pf-progress" role="status" aria-live="polite">
        {progress}
      </p>

      {complete ? (
        <div className="pa-pf-stamp">
          <p className="pa-stamp">{stamp}</p>
        </div>
      ) : null}

      <div className="pa-pf-actions">
        {complete ? (
          <button type="button" className="pa-link-btn" onClick={() => setDone(0)}>
            {labels.replay}
          </button>
        ) : (
          <button type="button" className="pa-link-btn" onClick={() => setDone(total)}>
            {labels.skip}
          </button>
        )}
      </div>
    </div>
  );
}
