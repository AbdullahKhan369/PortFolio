"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

interface Mark {
  id: string;
  label: string;
  at: number;
}

/**
 * The Light Spine: one beam of light on the left edge, drawn by scroll progress, shifting through the
 * spectrum (white, violet, azure, mint, amber). On desktop each section gets a tick on the beam:
 * hover for its name, click to glide there. Decorative (aria-hidden): the header menu is the real navigation.
 */
export function LightSpine() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const spring = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.4 });
  const p = reduced ? scrollYProgress : spring;
  const [palette, setPalette] = useState<string[]>(["#F2F4FF", "#8A5CFF", "#3AA0FF", "#4FE3B0", "#FFC857"]);
  const color = useTransform(scrollYProgress, [0, 0.22, 0.5, 0.75, 1], palette);
  const headTop = useTransform(p, (v) => `${Math.min(Math.max(v, 0), 1) * 100}%`);
  const [marks, setMarks] = useState<Mark[]>([]);

  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string): string => cs.getPropertyValue(name).trim() || fallback;
    setPalette(["#F2F4FF", read("--c-violet", "#8A5CFF"), read("--c-azure", "#3AA0FF"), read("--c-mint", "#4FE3B0"), read("--c-amber", "#FFC857")]);
  }, []);

  useEffect(() => {
    const measure = (): void => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const list: Mark[] = [];
      document.querySelectorAll<HTMLElement>("main > section[id]").forEach((s) => {
        const heading = s.querySelector("h2 .pa-sr") ?? s.querySelector("h2");
        const label = s.id === "hero" ? "" : (heading?.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 30);
        const at = Math.min(1, Math.max(0, (s.getBoundingClientRect().top + window.scrollY - 80) / max));
        list.push({ id: s.id, label, at });
      });
      setMarks(list);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const go = (id: string): void => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="pa-spine" aria-hidden="true">
      <div className="pa-spine-track" />
      <motion.div className="pa-spine-fill" style={{ scaleY: p, color, background: "currentColor" }} />
      {marks.map((m) => (
        <button key={m.id} type="button" tabIndex={-1} className="pa-spine-tick" style={{ top: `${m.at * 100}%` }} onClick={() => go(m.id)}>
          {m.label ? <span className="pa-spine-label">{m.label}</span> : null}
        </button>
      ))}
      <motion.span className="pa-spine-head" style={{ top: headTop, color, background: "currentColor" }} />
    </div>
  );
}
