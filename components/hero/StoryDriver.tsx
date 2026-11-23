"use client";

import { useEffect, useRef } from "react";

/**
 * Drives the hero story. Writes the scroll progress (0 to 1) of the pinned track into --sp on .pa-story;
 * every animation in styles/story.css is calculated from that one number. Does nothing on low-end devices,
 * with reduced motion or without JavaScript: the story then shows its finished, static version.
 */
export function StoryDriver() {
  const mark = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const story = mark.current?.closest<HTMLElement>(".pa-story");
    if (!story || document.documentElement.getAttribute("data-perf") !== "high") return;

    let raf = 0;
    let near = true;
    const update = (): void => {
      raf = 0;
      const r = story.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / span));
      story.style.setProperty("--sp", p.toFixed(4));
    };
    const onScroll = (): void => {
      if (near && !raf) raf = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        near = !!e?.isIntersecting;
        if (near) onScroll();
      },
      { rootMargin: "25% 0px" },
    );
    io.observe(story);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <span ref={mark} hidden />;
}
