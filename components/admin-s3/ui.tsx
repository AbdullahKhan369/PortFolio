"use client";
// Small shared pieces for the S3 nested admin editors. Colours inherit from the admin theme (currentColor),
// touch targets are 44px+, English only (admin is English).
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { getDb } from "./db";

export const inputCls = "w-full min-h-11 rounded-md border border-current/30 bg-transparent px-3 py-2 text-base";
export const btnCls = "inline-flex min-h-11 items-center justify-center rounded-md border border-current/40 px-4 text-base font-medium disabled:opacity-50";
export const btnPrimaryCls = "inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-base font-semibold text-white disabled:opacity-50";
export const dangerCls = "inline-flex min-h-11 items-center justify-center rounded-md border border-red-500/60 px-4 text-base text-red-500 disabled:opacity-50";

export function Panel({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <section className="mt-12 grid gap-4 border-t border-current/20 pt-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      {intro && <p className="max-w-prose text-sm opacity-75">{intro}</p>}
      {children}
    </section>
  );
}

export function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {help && <span className="opacity-70">{help}</span>}
    </label>
  );
}

export interface StatusState {
  kind: "idle" | "ok" | "error";
  text: string;
}

export function useStatus() {
  const [status, setStatus] = useState<StatusState>({ kind: "idle", text: "" });
  const ok = useCallback((text: string) => setStatus({ kind: "ok", text }), []);
  const err = useCallback((text: string) => setStatus({ kind: "error", text }), []);
  const clear = useCallback(() => setStatus({ kind: "idle", text: "" }), []);
  return { status, ok, err, clear };
}

export function StatusLine({ status }: { status: StatusState }) {
  return (
    <p role="status" aria-live="polite" className={`min-h-6 text-sm ${status.kind === "error" ? "text-red-500" : status.kind === "ok" ? "text-green-600" : ""}`}>
      {status.text}
    </p>
  );
}

export interface SystemOption {
  id: string;
  slug: string;
  title_en: string;
}

/** Loads all systems (admin sees hidden ones too) and keeps the selected one. */
export function useSystems() {
  const [systems, setSystems] = useState<SystemOption[]>([]);
  const [systemId, setSystemId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    getDb()
      .from("systems")
      .select("id,slug,title_en")
      .order("order_index", { ascending: true })
      .then(({ data, error: e }) => {
        if (!alive) return;
        if (e) return setError(e.message);
        const list = (data ?? []) as SystemOption[];
        setSystems(list);
        setSystemId((cur) => cur || list[0]?.id || "");
      });
    return () => {
      alive = false;
    };
  }, []);

  return { systems, systemId, setSystemId, error };
}

export function SystemPicker({ systems, value, onChange }: { systems: SystemOption[]; value: string; onChange: (id: string) => void }) {
  return (
    <Field label="System">
      <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
        {systems.length === 0 && <option value="">No systems yet. Add one above.</option>}
        {systems.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title_en}
          </option>
        ))}
      </select>
    </Field>
  );
}
