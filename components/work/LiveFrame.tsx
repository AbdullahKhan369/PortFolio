"use client";
// A real, live preview of a deployed site inside a device screen.
// - Loads only when it is near the viewport and only on capable devices (low tier shows the poster).
// - The page is rendered at its real size (vw x vh) and scaled to fit, so it looks like the real site.
// - Scroll is never trapped: the iframe ignores the pointer until the visitor clicks "explore",
//   and gives the pointer back as soon as it leaves the frame.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePerformanceTier } from "@/lib/device";
import styles from "./work.module.css";
import { cx } from "./utils";

interface Props {
  url: string;
  title: string;
  vw: number;
  vh: number;
  poster?: ReactNode;
  exploreLabel: string;
  doneLabel: string;
  badgeLabel: string;
  interactive?: boolean;
}

export default function LiveFrame({ url, title, vw, vh, poster, exploreLabel, doneLabel, badgeLabel, interactive = false }: Props) {
  const tier = usePerformanceTier();
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(false);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (w > 0) setScale(w / vw);
    });
    ro.observe(el);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [vw]);

  const live = tier === "high" && near && scale > 0;

  return (
    <div ref={box} className={styles.live} onPointerLeave={() => setActive(false)}>
      <div className={cx(styles.livePoster, loaded && styles.livePosterOff)}>{poster}</div>
      {live ? (
        <iframe
          className={styles.liveFrame}
          src={url}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          tabIndex={active ? 0 : -1}
          onLoad={() => setLoaded(true)}
          style={{ width: vw, height: vh, transform: `scale(${scale})`, pointerEvents: active ? "auto" : "none" }}
        />
      ) : null}
      {live && loaded ? (
        <span className={styles.liveBadge} aria-hidden="true">
          <i />
          {badgeLabel}
        </span>
      ) : null}
      {live && loaded && interactive && canHover && !active ? (
        <button type="button" className={styles.liveExplore} onClick={() => setActive(true)}>
          {exploreLabel}
        </button>
      ) : null}
      {active ? (
        <button type="button" className={styles.liveDone} onClick={() => setActive(false)}>
          {doneLabel}
        </button>
      ) : null}
    </div>
  );
}
