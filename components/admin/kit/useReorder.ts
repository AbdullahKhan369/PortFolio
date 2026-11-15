"use client";

import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
  const next = items.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Pointer-based drag to reorder (works with mouse, pen and touch). Rows need data-row-id="<id>".
 * Put the returned handle props on a drag handle that has CSS `touch-action: none`.
 * Keyboard and screen-reader users use the Move up / Move down actions instead.
 */
export function useReorder<T extends { id: string }>(
  items: T[],
  enabled: boolean,
  onCommit: (next: T[]) => void,
) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const overRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    setDragId(null);
    setOverId(null);
    overRef.current = null;
  }, []);

  const handleProps = useCallback(
    (id: string) => ({
      onPointerDown(e: ReactPointerEvent<HTMLElement>) {
        if (!enabled || (e.pointerType === "mouse" && e.button !== 0)) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragId(id);
        setOverId(id);
        overRef.current = id;
      },
      onPointerMove(e: ReactPointerEvent<HTMLElement>) {
        if (!enabled || dragId !== id) return;
        // Auto-scroll near the screen edges.
        if (e.clientY < 90) window.scrollBy(0, -14);
        else if (e.clientY > window.innerHeight - 90) window.scrollBy(0, 14);
        const el = document
          .elementsFromPoint(e.clientX, e.clientY)
          .map((n) => n.closest<HTMLElement>("[data-row-id]"))
          .find(Boolean);
        const target = el?.dataset.rowId;
        if (target && target !== overRef.current) {
          overRef.current = target;
          setOverId(target);
        }
      },
      onPointerUp(e: ReactPointerEvent<HTMLElement>) {
        if (!enabled || dragId !== id) return;
        e.currentTarget.releasePointerCapture?.(e.pointerId);
        const from = items.findIndex((i) => i.id === id);
        const to = items.findIndex((i) => i.id === overRef.current);
        reset();
        if (from !== -1 && to !== -1 && from !== to) onCommit(moveItem(items, from, to));
      },
      onPointerCancel: reset,
    }),
    [enabled, dragId, items, onCommit, reset],
  );

  return { dragId, overId, handleProps };
}
