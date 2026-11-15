"use client";

import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Optional override for the close button label (defaults follow <html lang>). */
  closeLabel?: string;
}

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

let lockCount = 0;
let previousOverflow = "";

function lockScroll(): void {
  if (lockCount === 0) {
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
  }
  lockCount += 1;
}

function unlockScroll(): void {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) document.documentElement.style.overflow = previousOverflow;
}

/**
 * Bottom sheet on mobile, centered modal from 768px up (layout is pure CSS, see pa-sheet in site.css).
 * Focus trap, Esc to close, scroll lock, background made inert, focus returns to the opener,
 * drag-down on the handle to dismiss (mobile).
 */
export function Sheet({ open, onClose, title, children, closeLabel }: SheetProps) {
  const [mounted, setMounted] = useState(false);
  const [render, setRender] = useState(false);
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const dragRef = useRef<{ y: number } | null>(null);
  const titleId = useId();

  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mount, then flip to "open" two frames later so the CSS transition runs; on close keep it mounted until the exit finishes.
  useEffect(() => {
    if (open) {
      setRender(true);
      let r2 = 0;
      const r1 = window.requestAnimationFrame(() => {
        r2 = window.requestAnimationFrame(() => setShown(true));
      });
      return () => {
        window.cancelAnimationFrame(r1);
        window.cancelAnimationFrame(r2);
      };
    }
    setShown(false);
    const t = window.setTimeout(() => setRender(false), 340);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open || !render) return;
    const opener = document.activeElement as HTMLElement | null;
    lockScroll();
    const app = document.getElementById("pa-app");
    app?.setAttribute("inert", "");
    panelRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (items.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0] as HTMLElement;
      const last = items[items.length - 1] as HTMLElement;
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      unlockScroll();
      app?.removeAttribute("inert");
      opener?.focus?.({ preventScroll: true });
    };
  }, [open, render]);

  const onHandleDown = (e: ReactPointerEvent<HTMLDivElement>): void => {
    dragRef.current = { y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
    panelRef.current?.style.setProperty("transition", "none");
  };
  const onHandleMove = (e: ReactPointerEvent<HTMLDivElement>): void => {
    if (!dragRef.current || !panelRef.current) return;
    const dy = Math.max(0, e.clientY - dragRef.current.y);
    panelRef.current.style.transform = `translateY(${dy}px)`;
  };
  const onHandleUp = (e: ReactPointerEvent<HTMLDivElement>): void => {
    if (!dragRef.current) return;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current = null;
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.removeProperty("transition");
    panel.style.removeProperty("transform");
    if (dy > 110) onClose();
  };

  if (!mounted || !render) return null;

  const label = closeLabel ?? (document.documentElement.lang.startsWith("ur") ? "Band karein" : "Close");

  return createPortal(
    <div className="pa-sheet" data-state={shown ? "open" : "closed"}>
      <div className="pa-sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} className="pa-sheet-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <div
          className="pa-sheet-handle"
          aria-hidden="true"
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          onPointerCancel={onHandleUp}
        >
          <span />
        </div>
        <div className="pa-sheet-head">
          <h2 id={titleId} className="pa-sheet-title">
            {title}
          </h2>
          <button type="button" className="pa-sheet-close" onClick={onClose} aria-label={label}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>
        <div className="pa-sheet-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
