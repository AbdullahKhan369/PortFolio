"use client";

import styles from "./Sparks.module.css";
import type { SparkSpot } from "./positions";

interface Props {
  spot: SparkSpot;
  found: boolean;
  label: string;
  doneLabel: string;
  onCollect: (n: number) => void;
}

/**
 * One hidden spark. A real button, so keyboard and screen-reader users can find and collect it.
 * Faint until hovered or focused. The hit area is 48px even though the glyph is small.
 */
export default function Spark({ spot, found, label, doneLabel, onCollect }: Props) {
  return (
    <button
      type="button"
      disabled={found}
      aria-label={found ? doneLabel : label}
      onClick={() => onCollect(spot.n)}
      style={{ position: "absolute", pointerEvents: "auto", zIndex: 2, width: 48, height: 48, ...spot.style }}
      className={`${styles.glow} grid place-items-center rounded-full bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber`}
    >
      <span
        aria-hidden="true"
        className={`${found ? "" : styles.pulse} relative grid h-7 w-7 place-items-center rounded-full border border-amber font-display text-[13px] font-semibold text-amber`}
        style={{ opacity: found ? 0.95 : 0.5, background: found ? "rgba(255,200,87,0.18)" : "rgba(18,22,58,0.55)" }}
      >
        {found ? <span className={`${styles.burst} absolute inset-0 rounded-full border border-amber`} /> : null}
        {spot.n}
      </span>
    </button>
  );
}
