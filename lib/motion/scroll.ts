"use client";

import { useEffect, useRef, type RefObject } from "react";
import { clamp } from "./math";

/**
 * One shared, passive scroll listener for every scroll-linked element on the page.
 * No scroll hijacking: this only READS the scroll position and reports a 0..1 progress.
 *
 * Progress is 0 when the element's top edge is at `enter` (fraction of the viewport height,
 * from the top) and 1 when its bottom edge is at `exit`.
 *   - Normal section:   enter 0.8, exit 0.5
 *   - Pinned (sticky) rail: enter 0, exit 1  -> 0 when the rail reaches the top, 1 when its end reaches the bottom.
 */
interface Sub {
  el: Element;
  enter: number;
  exit: number;
  cb: (progress: number) => void;
  last: number;
}

const subs = new Set<Sub>();
let ticking = false;
let bound = false;

function measure(s: Sub): number {
  const rect = s.el.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  const travel = vh * (s.enter - s.exit) + rect.height;
  if (travel <= 0) return rect.top < vh * s.enter ? 1 : 0;
  return clamp((vh * s.enter - rect.top) / travel);
}

function flush(): void {
  ticking = false;
  subs.forEach((s) => {
    const p = measure(s);
    if (p !== s.last) {
      s.last = p;
      s.cb(p);
    }
  });
}

function schedule(): void {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(flush);
}

function bind(): void {
  if (bound) return;
  bound = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("orientationchange", schedule);
}

function unbind(): void {
  if (!bound || subs.size > 0) return;
  bound = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  window.removeEventListener("orientationchange", schedule);
}

export function subscribeScroll(
  el: Element,
  cb: (progress: number) => void,
  enter = 0.8,
  exit = 0.5,
): () => void {
  const sub: Sub = { el, enter, exit, cb, last: -1 };
  subs.add(sub);
  bind();
  schedule();
  return () => {
    subs.delete(sub);
    unbind();
  };
}

export interface ScrollLinkedOptions {
  enter?: number;
  exit?: number;
  /** When false nothing is subscribed (static / low-end / reduced-motion mode). */
  enabled?: boolean;
}

/** Calls `cb(progress)` on scroll without re-rendering React. `cb` should write to refs / style. */
export function useScrollLinked(
  ref: RefObject<Element | null>,
  cb: (progress: number) => void,
  opts: ScrollLinkedOptions = {},
): void {
  const { enter = 0.8, exit = 0.5, enabled = true } = opts;
  const cbRef = useRef(cb);
  useEffect(() => {
    cbRef.current = cb;
  });
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    return subscribeScroll(el, (p) => cbRef.current(p), enter, exit);
  }, [ref, enter, exit, enabled]);
}
