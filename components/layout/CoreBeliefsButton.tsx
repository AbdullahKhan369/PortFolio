"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { PreflightList, type PreflightLabels } from "@/components/beliefs/PreflightList";
import { Morph } from "./Morph";

export interface BeliefItem {
  id: string;
  text: string;
}

export interface CoreBeliefsLabels extends PreflightLabels {
  button: string;
  sheetTitle: string;
  intro: string;
}

/**
 * Header button that opens the pre-flight checklist (bottom sheet on mobile, modal on desktop).
 * The checkpoints and the stamp text come from the admin. With no checkpoints the button is not shown.
 */
export function CoreBeliefsButton({
  beliefs,
  stamp,
  labels,
  className,
}: {
  beliefs: BeliefItem[];
  stamp: string;
  labels: CoreBeliefsLabels;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  if (beliefs.length === 0) return null;

  return (
    <>
      <button
        type="button"
        className={`pa-beliefs-btn${className ? ` ${className}` : ""}`}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        data-pa-close
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
          <path d="M4 6.5h9M4 12h6M4 17.5h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M15 14.5l2.2 2.2L21 12.6" stroke="var(--c-mint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <Morph id="beliefs.button" text={labels.button} />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={labels.sheetTitle}>
        <p className="pa-pf-intro">{labels.intro}</p>
        <PreflightList items={beliefs} stamp={stamp} labels={labels} />
      </Sheet>
    </>
  );
}
