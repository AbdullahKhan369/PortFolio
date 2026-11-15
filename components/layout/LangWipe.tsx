"use client";

import { useEffect } from "react";

/**
 * The language switch curtain: four bands of the spectrum rise, the page changes language behind them, then they lift.
 * Replaces the old letter-by-letter scramble, which changed the text width on every frame and made the layout jump.
 * The toggle sets data-wipe="in" on <html> before navigating; when the new language has rendered this sets "out" and clears it.
 */
export function LangWipe({ lang }: { lang: string }) {
  useEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute("data-wipe") !== "in") return;
    root.setAttribute("data-wipe", "out");
    const t = window.setTimeout(() => root.removeAttribute("data-wipe"), 800);
    return () => window.clearTimeout(t);
  }, [lang]);
  return (
    <div className="pa-wipe" aria-hidden="true">
      <i /><i /><i /><i />
    </div>
  );
}
