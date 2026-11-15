import type { Lang } from "@/lib/content/types";

/**
 * Bilingual morph core (S2-private).
 *
 * The language switch is route based (/en <-> /ur), so the old DOM is replaced by new DOM.
 * To still animate "letter by letter" we remember the last rendered text of every marked
 * text node (by id) in module memory, which survives client-side navigation. When a marked
 * node mounts with new text right after a switch was armed, it scrambles from old to new.
 */
const lastText = new Map<string, string>();
const pendingFrom = new Map<string, { from: string; to: string }>();
let armed: { to: Lang; until: number } | null = null;

export function armMorph(to: Lang): void {
  armed = { to, until: Date.now() + 6000 };
}

/** Records `text` for `id` and returns the previous text when a morph should play, else null. */
export function takeMorphSource(id: string, text: string, lang: Lang): string | null {
  const prev = lastText.get(id);
  lastText.set(id, text);
  const live = armed !== null && armed.to === lang && Date.now() <= armed.until;
  if (!live) return null;
  if (prev !== undefined && prev !== text) {
    pendingFrom.set(id, { from: prev, to: text });
    return prev;
  }
  // Same text re-requested (React dev double effect): replay the pending morph if it never finished.
  const pending = pendingFrom.get(id);
  if (pending && pending.to === text) return pending.from;
  return null;
}

export function finishMorph(id: string): void {
  pendingFrom.delete(id);
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const GLYPHS = "abcdefghijklmnopqrstuvwxyz";

function glyphLike(ch: string): string {
  const g = GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? "a";
  const isUpper = ch !== ch.toLowerCase() && ch === ch.toUpperCase();
  return isUpper ? g.toUpperCase() : g;
}

/**
 * Wave from left to right: each character shows the old glyph, flickers through random
 * letters for a moment, then settles on the new character. Returns a cancel function that
 * leaves the final text in place.
 */
export function scramble(el: HTMLElement, from: string, to: string, ms = 760, onDone?: () => void): () => void {
  const len = Math.max(from.length, to.length);
  const flicker = 150;
  const settle: number[] = [];
  for (let i = 0; i < len; i += 1) {
    settle.push((i / Math.max(len - 1, 1)) * ms * 0.7 + Math.random() * ms * 0.22);
  }
  const start = performance.now();
  let raf = 0;
  let cancelled = false;

  const frame = (now: number): void => {
    if (cancelled) return;
    const t = now - start;
    let out = "";
    let done = true;
    for (let i = 0; i < len; i += 1) {
      const oldCh = from[i] ?? "";
      const newCh = to[i] ?? "";
      const at = settle[i] ?? 0;
      if (t >= at) {
        out += newCh;
      } else {
        done = false;
        if (t >= at - flicker && newCh !== " " && newCh !== "") out += glyphLike(newCh);
        else out += oldCh;
      }
    }
    el.textContent = out;
    if (done) {
      el.textContent = to;
      onDone?.();
      return;
    }
    raf = window.requestAnimationFrame(frame);
  };

  raf = window.requestAnimationFrame(frame);
  return () => {
    cancelled = true;
    window.cancelAnimationFrame(raf);
    el.textContent = to;
  };
}
