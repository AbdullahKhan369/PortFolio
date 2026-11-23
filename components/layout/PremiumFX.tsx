"use client";

import { useEffect, useState } from "react";

/**
 * Small premium touches, all progressive:
 *  - spotlight: a soft light follows the pointer inside cards (sets --mx / --my)
 *  - magnetic: big buttons lean a few pixels toward the pointer (sets --mgx / --mgy)
 *  - 3-6-9: typing 3, 6, 9 anywhere (not inside a form field) fires a spectrum burst
 * Pointer effects run only with a mouse (hover: hover) and without reduced motion. Renders nothing until the burst.
 */
const SPOT = ".pa-fact, .pa-row, .pa-hero2-role, .pa-story-card, [data-spot]";
const MAG = ".pa-btn--lg, .pa-header-wa, .pa-footer-wa, [data-magnetic]";

export function PremiumFX() {
  const [storm, setStorm] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let magnet: HTMLElement | null = null;
    let raf = 0;

    const release = (): void => {
      if (!magnet) return;
      magnet.style.removeProperty("--mgx");
      magnet.style.removeProperty("--mgy");
      magnet = null;
    };

    const onMove = (e: PointerEvent): void => {
      const t = e.target as Element | null;
      if (!t || !("closest" in t)) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const card = t.closest<HTMLElement>(SPOT);
        if (card) {
          const r = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${e.clientX - r.left}px`);
          card.style.setProperty("--my", `${e.clientY - r.top}px`);
        }
        if (reduced) return;
        const el = t.closest<HTMLElement>(MAG);
        if (el !== magnet) release();
        if (el) {
          magnet = el;
          const r = el.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) * 0.2;
          const dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
          el.style.setProperty("--mgx", `${Math.max(-8, Math.min(8, dx)).toFixed(1)}px`);
          el.style.setProperty("--mgy", `${Math.max(-6, Math.min(6, dy)).toFixed(1)}px`);
        }
      });
    };
    if (fine) {
      document.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", release);
    }

    let buf = "";
    let timer = 0;
    const onKey = (e: KeyboardEvent): void => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      buf = (buf + e.key).slice(-3);
      if (buf === "369") {
        buf = "";
        setStorm(true);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => setStorm(false), 3200);
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", release);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!storm) return null;
  return (
    <div className="pa-storm" role="status" aria-live="polite">
      {Array.from({ length: 12 }, (_, i) => (
        <i key={i} style={{ "--a": `${i * 30}deg`, "--c": `var(--c-${["violet", "azure", "mint", "amber"][i % 4]})` } as React.CSSProperties} />
      ))}
      <p>3 · 6 · 9</p>
    </div>
  );
}
