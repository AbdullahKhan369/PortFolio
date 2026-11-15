"use client";

import { useEffect } from "react";

/**
 * The opening: 3, 6, 9 (Tesla's numbers) flash one after another while a thin beam grows across the screen,
 * then white light floods the screen and the page is revealed. Pure CSS timeline (pa-i369 in site.css), about 1.9 s.
 * Plays once per browser session (the inline script in app/[lang]/layout.tsx sets data-intro). Skippable with the button or Esc.
 * Not shown with reduced motion, on low-end devices, when switched off in Admin > Appearance, or without JavaScript.
 */
export function Intro369({ skipLabel }: { skipLabel: string }) {
  useEffect(() => {
    const root = document.documentElement;
    const skip = (): void => root.setAttribute("data-intro-ended", "");
    const timer = window.setTimeout(skip, 2300);
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="pa-i369" role="presentation">
      <span className="pa-i369-beam" aria-hidden="true" />
      <span className="pa-i369-n pa-i369-n1" aria-hidden="true">3</span>
      <span className="pa-i369-n pa-i369-n2" aria-hidden="true">6</span>
      <span className="pa-i369-n pa-i369-n3" aria-hidden="true">9</span>
      <span className="pa-i369-flash" aria-hidden="true" />
      <button type="button" className="pa-intro-skip" onClick={() => document.documentElement.setAttribute("data-intro-ended", "")}>
        {skipLabel}
      </button>
    </div>
  );
}
