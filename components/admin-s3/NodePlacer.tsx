"use client";
// Tap-or-drag canvas for placing system nodes (x and y are 0..100). Arrow keys nudge the focused dot
// (Shift = 5). Touch-friendly: only the dots capture touches, so the page still scrolls normally.
import { useRef } from "react";

export interface PlacerNode {
  key: string;
  label: string;
  x: number;
  y: number;
}
export interface PlacerEdge {
  from_key: string;
  to_key: string;
}

const round1 = (n: number) => Math.round(Math.min(100, Math.max(0, n)) * 10) / 10;

export default function NodePlacer({
  nodes,
  edges,
  selectedKey,
  onSelect,
  onMove,
}: {
  nodes: PlacerNode[];
  edges: PlacerEdge[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onMove: (key: string, x: number, y: number) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<string | null>(null);

  const pos = (clientX: number, clientY: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r || r.width === 0 || r.height === 0) return null;
    return { x: round1(((clientX - r.left) / r.width) * 100), y: round1(((clientY - r.top) / r.height) * 100) };
  };

  const byKey = new Map(nodes.map((n) => [n.key, n]));

  return (
    <div>
      <div ref={box} className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-current/30 bg-current/5 md:aspect-[16/9]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {edges.map((e, i) => {
            const a = byKey.get(e.from_key);
            const b = byKey.get(e.to_key);
            if (!a || !b) return null;
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />;
          })}
        </svg>
        {nodes.map((n) => (
          <button
            key={n.key}
            type="button"
            aria-label={`${n.label || n.key}, x ${n.x}, y ${n.y}. Drag or use arrow keys to move.`}
            aria-pressed={selectedKey === n.key}
            className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center rounded-full border-2 text-xs font-semibold ${selectedKey === n.key ? "border-blue-500 bg-blue-500/30" : "border-current/60 bg-current/10"}`}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = n.key;
              onSelect(n.key);
            }}
            onPointerMove={(e) => {
              if (drag.current !== n.key) return;
              const p = pos(e.clientX, e.clientY);
              if (p) onMove(n.key, p.x, p.y);
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 5 : 1;
              const d: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
              const m = d[e.key];
              if (!m) return;
              e.preventDefault();
              onMove(n.key, round1(n.x + m[0]), round1(n.y + m[1]));
            }}
          >
            {(n.label || n.key).slice(0, 2)}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm opacity-70">Drag a dot to place it. Left is where the flow starts. Positions are saved with the Save button on each node.</p>
    </div>
  );
}
