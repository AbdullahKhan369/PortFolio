// Pure geometry for the systems graph. No React, no DOM: unit-testable in plain node.

export interface Pt {
  x: number;
  y: number;
}

/** Nodes carry x/y in 0..100 (admin). Maps them into a padded pixel box. */
export function toPixels(x: number, y: number, w: number, h: number, padX: number, padY: number): Pt {
  const cx = Math.min(100, Math.max(0, Number.isFinite(x) ? x : 50));
  const cy = Math.min(100, Math.max(0, Number.isFinite(y) ? y : 50));
  return { x: padX + (cx / 100) * Math.max(0, w - padX * 2), y: padY + (cy / 100) * Math.max(0, h - padY * 2) };
}

/** Wraps a label into at most `maxLines` lines of about `maxChars`; the last line is ellipsised if text remains. */
export function wrapLabel(label: string, maxChars: number, maxLines = 3): string[] {
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= maxChars || !cur) {
      cur = next;
    } else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/\s*\S{0,3}$/, "") + "\u2026";
    return kept;
  }
  return lines;
}

/** Start and end of an arrow between two circles of radius ra and rb (plus a gap), along the straight line. */
export function edgeEnds(a: Pt, b: Pt, ra: number, rb: number, gap = 4): { from: Pt; to: Pt; len: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.001) return { from: a, to: b, len: 0 };
  const ux = dx / len;
  const uy = dy / len;
  const s = Math.min(ra + gap, len / 2);
  const e = Math.min(rb + gap, len / 2);
  return { from: { x: a.x + ux * s, y: a.y + uy * s }, to: { x: b.x - ux * e, y: b.y - uy * e }, len };
}

/** Where to anchor a label horizontally so it never leaves the box. */
export function labelAnchor(x: number, w: number, margin: number): "start" | "middle" | "end" {
  if (x < margin) return "start";
  if (x > w - margin) return "end";
  return "middle";
}

/** Label goes under the node unless the node is near the bottom edge. */
export function labelBelow(y: number, h: number, nLines: number, r: number, lineH = 14): boolean {
  return y + r + 10 + nLines * lineH <= h;
}

export interface FlowNeighbours {
  incoming: string[];
  outgoing: string[];
}

export function neighbours(key: string, edges: { from: string; to: string }[]): FlowNeighbours {
  return {
    incoming: edges.filter((e) => e.to === key).map((e) => e.from),
    outgoing: edges.filter((e) => e.from === key).map((e) => e.to),
  };
}

export type LabelSide = "below" | "above" | "right" | "left";
export interface LabelPlan {
  side: LabelSide;
  anchor: "start" | "middle" | "end";
  /** x offset of the text, relative to the node centre */
  dx: number;
  /** baseline of the first line, relative to the node centre */
  y: number;
}

interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function segmentHitsRect(a: Pt, b: Pt, r: Rect, skip: number): boolean {
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  if (len < 0.001) return false;
  for (let d = skip; d <= len; d += 4) {
    const t = d / len;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    if (x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1) return true;
  }
  return false;
}

/**
 * Chooses where a node's label goes (below, above, right or left) so it does not sit on top of the arrows that
 * touch the node, on other nodes, or outside the drawing. `edgeTargets` are the far ends of the node's own edges.
 */
export function planLabel(
  p: Pt,
  edgeTargets: Pt[],
  otherNodes: Pt[],
  lines: string[],
  w: number,
  h: number,
  r: number,
  lineH = 14,
  charW = 6.8,
): LabelPlan {
  const n = Math.max(1, lines.length);
  const tw = Math.max(...lines.map((l) => l.length), 1) * charW;
  const pad = tw / 2 + 6;
  const hAnchor = labelAnchor(p.x, w, pad);
  const hx0 = hAnchor === "start" ? p.x - r : hAnchor === "end" ? p.x + r - tw : p.x - tw / 2;
  const blockH = n * lineH + 4;

  const sides: { side: LabelSide; rect: Rect; plan: LabelPlan }[] = [
    {
      side: "below",
      rect: { x0: hx0, x1: hx0 + tw, y0: p.y + r, y1: p.y + r + 6 + blockH },
      plan: { side: "below", anchor: hAnchor, dx: hAnchor === "start" ? -r : hAnchor === "end" ? r : 0, y: r + 18 },
    },
    {
      side: "above",
      rect: { x0: hx0, x1: hx0 + tw, y0: p.y - r - 6 - blockH, y1: p.y - r },
      plan: { side: "above", anchor: hAnchor, dx: hAnchor === "start" ? -r : hAnchor === "end" ? r : 0, y: -(r + 12) - (n - 1) * lineH },
    },
    {
      side: "right",
      rect: { x0: p.x + r + 4, x1: p.x + r + 4 + tw, y0: p.y - blockH / 2, y1: p.y + blockH / 2 },
      plan: { side: "right", anchor: "start", dx: r + 8, y: -((n - 1) * lineH) / 2 + 4 },
    },
    {
      side: "left",
      rect: { x0: p.x - r - 4 - tw, x1: p.x - r - 4, y0: p.y - blockH / 2, y1: p.y + blockH / 2 },
      plan: { side: "left", anchor: "end", dx: -(r + 8), y: -((n - 1) * lineH) / 2 + 4 },
    },
  ];

  let best = sides[0];
  let bestScore = Infinity;
  for (const s of sides) {
    let score = 0;
    if (s.rect.x0 < 2 || s.rect.x1 > w - 2 || s.rect.y0 < 2 || s.rect.y1 > h - 2) score += 20;
    for (const t of edgeTargets) if (segmentHitsRect(p, t, s.rect, r)) score += 6;
    for (const o of otherNodes) {
      if (o.x >= s.rect.x0 - r && o.x <= s.rect.x1 + r && o.y >= s.rect.y0 - r && o.y <= s.rect.y1 + r) score += 4;
    }
    if (score < bestScore) {
      best = s;
      bestScore = score;
    }
  }
  return best.plan;
}

/**
 * Fits nodes to their own bounding box (0..100 on both axes) so a small diagram uses the whole canvas.
 * With `transpose` the axes swap: a left-to-right flow becomes top-to-bottom, which is what a narrow phone needs.
 */
export function fitNodes(nodes: { key: string; x: number; y: number }[], transpose: boolean): Map<string, Pt> {
  const xs = nodes.map((n) => (Number.isFinite(n.x) ? n.x : 50));
  const ys = nodes.map((n) => (Number.isFinite(n.y) ? n.y : 50));
  const span = (a: number[]) => {
    const lo = Math.min(...a);
    const hi = Math.max(...a);
    return { lo, hi, d: hi - lo };
  };
  const sx = span(xs);
  const sy = span(ys);
  const norm = (v: number, s: { lo: number; d: number }) => (s.d < 0.5 ? 50 : ((v - s.lo) / s.d) * 100);
  const out = new Map<string, Pt>();
  nodes.forEach((n, i) => {
    const u = norm(xs[i], sx);
    const v = norm(ys[i], sy);
    out.set(n.key, transpose ? { x: v, y: u } : { x: u, y: v });
  });
  return out;
}
