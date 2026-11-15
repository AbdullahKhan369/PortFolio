"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type Kind = "success" | "error" | "info";
interface ToastItem { id: number; kind: Kind; text: string }

export interface ToastApi {
  success: (text: string) => void;
  error: (text: string) => void;
  info: (text: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

/** Toasts: success "Saved", failure explains what to do. z-index 70 (above sheets and modals). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (kind: Kind, text: string) => {
      const id = ++counter.current;
      setItems((list) => [...list.slice(-3), { id, kind, text }]);
      window.setTimeout(() => dismiss(id), kind === "error" ? 8000 : 4000);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (t) => push("success", t),
      error: (t) => push("error", t),
      info: (t) => push("info", t),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="a-toasts" aria-live="polite" aria-atomic="false">
        {items.map((t) => (
          <div key={t.id} className="a-toast" data-kind={t.kind} role={t.kind === "error" ? "alert" : "status"}>
            <span>{t.text}</span>
            <button type="button" className="a-toast-x" onClick={() => dismiss(t.id)} aria-label="Dismiss message">
              Close
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const fallbackApi: ToastApi = {
  success: (t) => console.info(t),
  error: (t) => console.error(t),
  info: (t) => console.info(t),
};

export function useToast(): ToastApi {
  return useContext(ToastContext) ?? fallbackApi;
}
