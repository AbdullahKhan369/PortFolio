"use client";

import type { MetricValue } from "./model";

interface MetricsEditorProps {
  value: MetricValue[];
  onChange: (next: MetricValue[]) => void;
  idPrefix: string;
}

/**
 * Edits Metric[]. The value is optional on purpose: a metric with an empty value is saved
 * but never shown on the public site (numbers policy).
 */
export function MetricsEditor({ value, onChange, idPrefix }: MetricsEditorProps) {
  const update = (i: number, patch: Partial<MetricValue>) =>
    onChange(value.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="a-stack">
      {value.length === 0 ? (
        <p className="a-help">No entries yet. Leave a value empty and it stays hidden on the public site.</p>
      ) : null}
      {value.map((m, i) => (
        <fieldset key={i} className="a-metric">
          <legend className="a-sr-only">Entry {i + 1}</legend>
          <div className="a-metric-grid">
            <label className="a-sublabel" htmlFor={`${idPrefix}-${i}-en`}>
              Label (English)
              <input id={`${idPrefix}-${i}-en`} className="a-input" value={m.label_en} maxLength={80}
                onChange={(e) => update(i, { label_en: e.target.value })} />
            </label>
            <label className="a-sublabel" htmlFor={`${idPrefix}-${i}-ur`}>
              Label (Roman Urdu)
              <input id={`${idPrefix}-${i}-ur`} className="a-input" value={m.label_ur} maxLength={80}
                onChange={(e) => update(i, { label_ur: e.target.value })} />
            </label>
            <label className="a-sublabel" htmlFor={`${idPrefix}-${i}-v`}>
              Value (optional)
              <input id={`${idPrefix}-${i}-v`} className="a-input" value={m.value} maxLength={60}
                inputMode="text" onChange={(e) => update(i, { value: e.target.value })} />
            </label>
          </div>
          <button type="button" className="a-btn a-btn-quiet" onClick={() => remove(i)}>
            Remove entry {i + 1}
          </button>
        </fieldset>
      ))}
      <div>
        <button type="button" className="a-btn a-btn-ghost"
          onClick={() => onChange([...value, { label_en: "", label_ur: "", value: "" }])}>
          Add entry
        </button>
      </div>
    </div>
  );
}
