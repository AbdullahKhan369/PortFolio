"use client";

import { useEffect } from "react";

/** Each section is a chapter with its own colour of light. The page glow (--chapter) glides to the colour of the section in view. */
const CHAPTER_COLOR: Record<string, string> = {
  hero: "--c-violet", achievements: "--c-violet", projects: "--c-azure", marketing: "--c-mint", systems: "--c-amber",
  services: "--c-violet", process: "--c-azure", try: "--c-mint", studio: "--c-amber", about: "--c-violet", contact: "--c-azure",
};

export function Chapters() {
  useEffect(() => {
    const root = document.documentElement;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section[id]"));
    if (sections.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const v = CHAPTER_COLOR[(e.target as HTMLElement).id] ?? "--c-violet";
          root.style.setProperty("--chapter", `var(${v})`);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
  return null;
}
