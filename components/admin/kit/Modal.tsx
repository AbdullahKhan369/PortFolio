"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** "sheet": full-height on phones, side panel on desktop. "dialog": small centered box. */
  variant?: "sheet" | "dialog";
  children: ReactNode;
  footer?: ReactNode;
  /** Block Esc / backdrop close (for example while saving). */
  locked?: boolean;
}

/** Accessible overlay: focus trap, Esc to close, restores focus, locks page scroll. z-index 60. */
export function Modal({ open, onClose, title, variant = "sheet", children, footer, locked }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const lockedRef = useRef(locked);
  lockedRef.current = locked;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const scrollY = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const el = panel.current;
    const first = el?.querySelector<HTMLElement>("[data-autofocus]") ?? el?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? el)?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !lockedRef.current) {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const nodes = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === firstNode) {
        e.preventDefault();
        lastNode.focus();
      } else if (!e.shiftKey && document.activeElement === lastNode) {
        e.preventDefault();
        firstNode.focus();
      }
    }
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
      window.scrollTo(0, scrollY);
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="a-overlay" data-variant={variant}>
      <div className="a-backdrop" onClick={() => !locked && onClose()} aria-hidden="true" />
      <div
        ref={panel}
        className="a-panel"
        data-variant={variant}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="a-panel-head">
          <h2 id={titleId} className="a-panel-title">{title}</h2>
          <button type="button" className="a-btn a-btn-quiet" onClick={onClose} disabled={locked}>
            Close
          </button>
        </header>
        <div className="a-panel-body">{children}</div>
        {footer ? <footer className="a-panel-foot">{footer}</footer> : null}
      </div>
    </div>
  );
}
