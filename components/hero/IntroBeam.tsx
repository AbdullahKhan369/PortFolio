"use client";

import { useEffect, useRef } from "react";

/**
 * The load sequence: a beam of white light crosses a prism and splits into four rays, then the
 * overlay clears. Pure CSS timeline (see pa-intro in site.css), so it costs no JavaScript per frame.
 *  - Runs once per browser session: an inline script in app/[lang]/layout.tsx sets data-intro="seen" on <html>.
 *  - Skippable with the button or Esc.
 *  - Reduced motion and no-JS: not shown. Low-end phones: same sequence, shorter (CSS --ps).
 *  - Landscape uses a horizontal beam, portrait (phones) a vertical one.
 */
export function IntroBeam({ skipLabel }: { skipLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    // After the hero reveal has finished, never replay it on this page session (for example after a language switch remount).
    const played = window.setTimeout(() => {
      root.dataset.heroPlayed = "1";
    }, 3800);

    const skip = (): void => {
      if (root.dataset.introEnded) return;
      ref.current?.setAttribute("data-skip", "true");
      root.dataset.intro = "seen";
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(played);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const end = (): void => {
    document.documentElement.dataset.introEnded = "1";
  };

  const skipNow = (): void => {
    ref.current?.setAttribute("data-skip", "true");
    document.documentElement.dataset.intro = "seen";
  };

  return (
    <div
      ref={ref}
      className="pa-intro"
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) end();
      }}
    >
      <svg className="pa-intro-svg" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        {/* Landscape: beam travels left to right */}
        <g className="pa-intro-h">
          <path className="pa-i-fill" d="M200 150 L250 236 L150 236 Z" fill="rgba(242,244,255,.07)" />
          <path className="pa-i-draw pa-i-prism" d="M200 150 L250 236 L150 236 Z" pathLength={1} fill="none" stroke="#F2F4FF" strokeWidth="1.6" strokeLinejoin="round" />
          <path className="pa-i-draw pa-i-beam" d="M0 205 L168 205" pathLength={1} fill="none" stroke="#F2F4FF" strokeWidth="2.6" strokeLinecap="round" />
          <path className="pa-i-draw pa-i-inner" d="M168 205 L238 215" pathLength={1} fill="none" stroke="#F2F4FF" strokeOpacity=".55" strokeWidth="1.6" strokeLinecap="round" />
          <circle className="pa-i-flash" cx="238" cy="215" r="5" fill="#F2F4FF" />
          <path className="pa-i-draw pa-i-ray pa-i-ray--amber" d="M238 215 L420 232" pathLength={1} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          <path className="pa-i-draw pa-i-ray pa-i-ray--mint" d="M238 215 L420 264" pathLength={1} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          <path className="pa-i-draw pa-i-ray pa-i-ray--azure" d="M238 215 L420 298" pathLength={1} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          <path className="pa-i-draw pa-i-ray pa-i-ray--violet" d="M238 215 L420 336" pathLength={1} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </g>
        {/* Portrait: beam travels top to bottom */}
        <g className="pa-intro-v">
          <path className="pa-i-fill" d="M250 200 L164 150 L164 250 Z" fill="rgba(242,244,255,.07)" />
          <path className="pa-i-draw pa-i-prism" d="M250 200 L164 150 L164 250 Z" pathLength={1} fill="none" stroke="#F2F4FF" strokeWidth="1.6" strokeLinejoin="round" />
          <path className="pa-i-draw pa-i-beam" d="M185 0 L185 162" pathLength={1} fill="none" stroke="#F2F4FF" strokeWidth="2.6" strokeLinecap="round" />
          <path className="pa-i-draw pa-i-inner" d="M185 162 L216 220" pathLength={1} fill="none" stroke="#F2F4FF" strokeOpacity=".55" strokeWidth="1.6" strokeLinecap="round" />
          <circle className="pa-i-flash" cx="216" cy="220" r="5" fill="#F2F4FF" />
          <path className="pa-i-draw pa-i-ray pa-i-ray--violet" d="M216 220 L120 420" pathLength={1} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          <path className="pa-i-draw pa-i-ray pa-i-ray--azure" d="M216 220 L168 420" pathLength={1} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          <path className="pa-i-draw pa-i-ray pa-i-ray--mint" d="M216 220 L216 420" pathLength={1} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          <path className="pa-i-draw pa-i-ray pa-i-ray--amber" d="M216 220 L264 420" pathLength={1} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      </svg>
      <button type="button" className="pa-btn pa-btn--ghost pa-intro-skip" onClick={skipNow}>
        {skipLabel}
      </button>
    </div>
  );
}
