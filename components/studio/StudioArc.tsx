"use client";

import { useRef } from "react";
import { usePerformanceTier } from "@/lib/device";
import { clamp, useScrollLinked } from "@/lib/motion";

const CX = 200;
const CY = 196;
const R = 176;
const COLORS = ["var(--c-violet)", "var(--c-azure)", "var(--c-mint)", "var(--c-amber)"];

/**
 * The Prism Arc: a spectral arc drawn by scroll, with one marker per offer.
 * Markers light as the arc reaches them. Static (fully drawn, all lit) for low-end, reduced motion and no JS.
 */
export function StudioArc({ count }: { count: number }) {
  const live = usePerformanceTier() === "high";
  const ref = useRef<HTMLDivElement>(null);
  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const n = Math.max(1, count);

  useScrollLinked(
    ref,
    (p) => {
      const draw = clamp(p / 0.78);
      ref.current?.style.setProperty("--draw", draw.toFixed(3));
      dots.current.forEach((dot, i) => {
        if (!dot) return;
        const on = draw >= (i + 0.5) / n;
        const next = on ? "true" : "false";
        if (dot.getAttribute("data-lit") !== next) dot.setAttribute("data-lit", next);
      });
    },
    { enter: 0.9, exit: 0.45, enabled: live },
  );

  const points = Array.from({ length: n }, (_, i) => {
    const angle = Math.PI - (Math.PI * (i + 0.5)) / n;
    return { x: CX + R * Math.cos(angle), y: CY - R * Math.sin(angle) };
  });

  return (
    <div ref={ref} className="pa-arc" aria-hidden="true">
      <svg viewBox="0 0 400 214" focusable="false">
        <defs>
          <linearGradient id="pa-arc-grad" gradientUnits="userSpaceOnUse" x1="24" y1="0" x2="376" y2="0">
            <stop offset="0" stopColor="#8A5CFF" />
            <stop offset=".38" stopColor="#3AA0FF" />
            <stop offset=".7" stopColor="#4FE3B0" />
            <stop offset="1" stopColor="#FFC857" />
          </linearGradient>
        </defs>
        <path d={`M${CX - R} ${CY} A${R} ${R} 0 0 1 ${CX + R} ${CY}`} className="pa-arc-base" fill="none" strokeWidth="2" pathLength={1} />
        <path d={`M${CX - R} ${CY} A${R} ${R} 0 0 1 ${CX + R} ${CY}`} className="pa-arc-draw" fill="none" stroke="url(#pa-arc-grad)" strokeWidth="4" strokeLinecap="round" pathLength={1} />
        {points.map((pt, i) => (
          <circle
            key={i}
            ref={(el) => {
              dots.current[i] = el;
            }}
            className="pa-arc-dot"
            data-lit="false"
            cx={pt.x.toFixed(1)}
            cy={pt.y.toFixed(1)}
            r="7"
            style={{ ["--dot" as string]: COLORS[i % COLORS.length] }}
          />
        ))}
      </svg>
    </div>
  );
}
