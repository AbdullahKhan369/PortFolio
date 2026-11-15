"use client";

import { useEffect } from "react";

/**
 * Makes the hero prism react to the mouse: the scene drifts a little and the four rays fan with the cursor.
 * Sets --px / --py (-1..1) on the hero. Desktop pointers on capable devices only; nothing renders.
 */
export function PrismPointer() {
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced || document.documentElement.getAttribute("data-perf") !== "high" || document.documentElement.getAttribute("data-fx-cursor") === "off") return;

    let raf = 0;
    const onMove = (e: PointerEvent): void => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 2 - 1;
        const y = ((e.clientY - r.top) / r.height) * 2 - 1;
        document.documentElement.style.setProperty("--px", Math.max(-1, Math.min(1, x)).toFixed(3));
        document.documentElement.style.setProperty("--py", Math.max(-1, Math.min(1, y)).toFixed(3));
      });
    };
    hero.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      hero.removeEventListener("pointermove", onMove);
    };
  }, []);

  return null;
}
