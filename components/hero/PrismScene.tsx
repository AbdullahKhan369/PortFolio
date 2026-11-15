/**
 * Hero visual: white light enters a glass prism and leaves as four rays (violet, azure, mint, amber),
 * the same four colours as the rest of the site. Pure SVG + CSS (see pa-scene in site.css).
 * Decorative, so it is hidden from screen readers.
 */
import type { CSSProperties } from "react";

const RAYS = [
  { c: "var(--c-violet)", y: 168 },
  { c: "var(--c-azure)", y: 232 },
  { c: "var(--c-mint)", y: 296 },
  { c: "var(--c-amber)", y: 360 },
];

export function PrismScene() {
  return (
    <div className="pa-scene" aria-hidden="true">
      <svg viewBox="0 0 600 560" className="pa-scene-svg" focusable="false">
        <defs>
          <linearGradient id="pa-glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F2F4FF" stopOpacity="0.22" />
            <stop offset="0.55" stopColor="#8A5CFF" stopOpacity="0.10" />
            <stop offset="1" stopColor="#3AA0FF" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id="pa-beam-in" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="207" y2="0">
            <stop offset="0" stopColor="#F2F4FF" stopOpacity="0" />
            <stop offset="1" stopColor="#F2F4FF" stopOpacity="1" />
          </linearGradient>
          <filter id="pa-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        {/* the arc: a faint orbit around the prism */}
        <ellipse className="pa-arc" cx="300" cy="280" rx="262" ry="236" fill="none" stroke="#9096C4" strokeOpacity="0.28" strokeWidth="1.2" strokeDasharray="3 9" />

        {/* incoming beam */}
        <path className="pa-beam" d="M0 262 L207 262" stroke="url(#pa-beam-in)" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path className="pa-beam pa-beam-glow" d="M0 262 L207 262" stroke="#F2F4FF" strokeWidth="14" strokeLinecap="round" fill="none" filter="url(#pa-blur)" opacity="0.55" />

        {/* prism */}
        <path className="pa-prism" d="M300 100 L420 310 L180 310 Z" fill="url(#pa-glass)" stroke="#F2F4FF" strokeOpacity="0.55" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M300 100 L300 310" stroke="#F2F4FF" strokeOpacity="0.10" strokeWidth="1" />
        <path className="pa-inner" d="M207 262 L386 250" stroke="#F2F4FF" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />

        {/* four rays (fan with the cursor, see PrismPointer) */}
        <g className="pa-rays">
        {RAYS.map((r, i) => (
          <g key={r.y} className="pa-ray" style={{ "--i": i } as CSSProperties}>
            <path d={`M386 250 L600 ${r.y}`} stroke={r.c} strokeWidth="12" strokeLinecap="round" fill="none" filter="url(#pa-blur)" opacity="0.6" pathLength={1} />
            <path d={`M386 250 L600 ${r.y}`} stroke={r.c} strokeWidth="3.2" strokeLinecap="round" fill="none" pathLength={1} />
          </g>
        ))}
        </g>
      </svg>
    </div>
  );
}
