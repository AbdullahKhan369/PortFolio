"use client";

import { useEffect, useRef } from "react";
import { createPrismGL } from "@/lib/gl/prism-gl";

/**
 * The hero canvas: a real-time prism (see lib/gl/prism-gl.ts). Mobile first:
 * phones render at a lower resolution and the prism sits in the lower half under the text; dragging a finger or moving a mouse
 * tilts the prism and swings the spectrum; scrolling past the hero fans the spectrum wider.
 * It only runs while the hero is on screen. Without WebGL, on low-end devices or with the effect switched off,
 * nothing happens and the SVG prism that is already in the page stays.
 */
export function PrismStage() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const hero = document.getElementById("hero");
    const root = document.documentElement;
    if (!canvas || !hero) return;
    if (root.getAttribute("data-perf") !== "high" || root.getAttribute("data-fx-webgl") === "off") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    const gl = createPrismGL(canvas, { quality: compact ? 0.7 : 1, maxDpr: compact ? 1.5 : 2, animate: !reduced });
    if (!gl) return;
    root.setAttribute("data-gl", "on");

    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) gl.start();
      else gl.stop();
    });
    io.observe(hero);

    const onMove = (e: PointerEvent): void => {
      const r = hero.getBoundingClientRect();
      gl.setPointer(((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1, ((e.clientY - r.top) / Math.max(1, window.innerHeight)) * 2 - 1);
    };
    hero.addEventListener("pointermove", onMove, { passive: true });

    const onScroll = (): void => {
      const r = hero.getBoundingClientRect();
      gl.setScroll(Math.min(1, Math.max(0, -r.top / Math.max(1, window.innerHeight * 0.8))));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const ro = new ResizeObserver(() => gl.resize());
    ro.observe(canvas);

    return () => {
      io.disconnect();
      ro.disconnect();
      hero.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      root.removeAttribute("data-gl");
      gl.destroy();
    };
  }, []);

  return <canvas ref={ref} className="pa-gl" aria-hidden="true" />;
}
