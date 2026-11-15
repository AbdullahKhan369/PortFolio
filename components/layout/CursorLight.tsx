"use client";

import { useEffect, useRef } from "react";

/**
 * The cursor is a source of light: a soft orb that trails the mouse and swells over links and buttons.
 * Desktop fine pointers only (never on touch), capable devices only, off with reduced motion or Admin > Appearance. The real cursor stays visible.
 */
export function CursorLight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const root = document.documentElement;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || root.getAttribute("data-perf") !== "high" || root.getAttribute("data-fx-cursor") === "off") return;

    let x = -100, y = -100, tx = -100, ty = -100, raf = 0, shown = false;
    const loop = (): void => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent): void => {
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        shown = true;
        x = tx;
        y = ty;
        el.setAttribute("data-on", "");
        raf = requestAnimationFrame(loop);
      }
      const hot = (e.target as Element | null)?.closest("a, button, [role=button], summary, label, input, textarea, select");
      el.toggleAttribute("data-hot", !!hot);
    };
    const onLeave = (): void => el.removeAttribute("data-on");
    const onEnter = (): void => {
      if (shown) el.setAttribute("data-on", "");
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  return <div ref={ref} className="pa-orb" aria-hidden="true" />;
}
