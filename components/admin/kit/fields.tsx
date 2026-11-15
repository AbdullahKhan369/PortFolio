"use client";

import { useId, useState, type KeyboardEvent } from "react";
import type { FieldDef } from "./types";
import type { FormValues, MetricValue } from "./model";
import { ImageUpload } from "./ImageUpload";
import { MetricsEditor } from "./MetricsEditor";

interface FieldProps {
  field: FieldDef;
  values: FormValues;
  errors: Record<string, string>;
  onChange: (key: string, value: unknown) => void;
  disabled?: boolean;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
const list = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

/** Renders one FieldDef with label, help text and its error message. */
export function FieldRenderer({ field, values, errors, onChange, disabled }: FieldProps) {
  const uid = useId();
  const id = `f-${uid}`;
  const errKeys = field.type.startsWith("bilingual") ? [`${field.name}_en`, `${field.name}_ur`] : [field.name];
  const error = errKeys.map((k) => errors[k]).find(Boolean);
  const helpId = field.help ? `${id}-help` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [helpId, errId].filter(Boolean).join(" ") || undefined;
  const invalid = !!error;
  const requiredMark = field.required ? <span className="a-req"> (required)</span> : null;

  const common = {
    id,
    className: "a-input",
    disabled,
    "aria-invalid": invalid || undefined,
    "aria-describedby": describedBy,
    required: field.required,
  } as const;

  let control: React.ReactNode;
  switch (field.type) {
    case "text":
      control = <input {...common} type="text" value={str(values[field.name])} placeholder={field.placeholder}
        onChange={(e) => onChange(field.name, e.target.value)} />;
      break;
    case "url":
      control = <input {...common} type="url" inputMode="url" autoCapitalize="none" value={str(values[field.name])}
        placeholder={field.placeholder ?? "https://"} onChange={(e) => onChange(field.name, e.target.value)} />;
      break;
    case "textarea":
      control = <textarea {...common} rows={5} value={str(values[field.name])} placeholder={field.placeholder}
        onChange={(e) => onChange(field.name, e.target.value)} />;
      break;
    case "number":
      control = <input {...common} type="text" inputMode="decimal" value={str(values[field.name])}
        placeholder={field.placeholder} onChange={(e) => onChange(field.name, e.target.value)} />;
      break;
    case "date":
      control = <input {...common} type="date" value={str(values[field.name])}
        onChange={(e) => onChange(field.name, e.target.value)} />;
      break;
    case "select":
      control = (
        <select {...common} value={str(values[field.name])} onChange={(e) => onChange(field.name, e.target.value)}>
          {!field.required || !str(values[field.name]) ? <option value="">{field.required ? "Choose..." : "None"}</option> : null}
          {(field.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
      break;
    case "boolean":
      control = (
        <button type="button" id={id} role="switch" aria-checked={values[field.name] === true}
          aria-describedby={describedBy} disabled={disabled} className="a-switch"
          onClick={() => onChange(field.name, values[field.name] !== true)}>
          <span className="a-switch-track" aria-hidden="true"><span className="a-switch-thumb" /></span>
          <span>{values[field.name] === true ? "On" : "Off"}</span>
        </button>
      );
      break;
    case "color": {
      const v = str(values[field.name]);
      control = (
        <div className="a-color">
          <input type="color" aria-label={`${field.label} picker`} value={/^#[0-9a-fA-F]{6}$/.test(v) ? v : "#000000"}
            disabled={disabled} onChange={(e) => onChange(field.name, e.target.value.toUpperCase())} />
          <input {...common} type="text" value={v} placeholder="#12163A" maxLength={7} autoCapitalize="characters"
            onChange={(e) => onChange(field.name, e.target.value)} />
        </div>
      );
      break;
    }
    case "tags":
      control = <TagsInput id={id} value={list(values[field.name])} onChange={(v) => onChange(field.name, v)}
        disabled={disabled} describedBy={describedBy} placeholder={field.placeholder} />;
      break;
    case "image":
      control = <ImageUpload id={id} value={str(values[field.name])} onChange={(v) => onChange(field.name, v)}
        folder={field.folder} label={field.label} invalid={invalid} describedBy={describedBy} />;
      break;
    case "bilingual-text":
      control = <BilingualPair id={id} kind="text" name={field.name} values={values} onChange={onChange}
        disabled={disabled} required={field.required} describedBy={describedBy} invalid={invalid} errors={errors}
        placeholder={field.placeholder} />;
      break;
    case "bilingual-textarea":
      control = <BilingualPair id={id} kind="textarea" name={field.name} values={values} onChange={onChange}
        disabled={disabled} required={field.required} describedBy={describedBy} invalid={invalid} errors={errors}
        placeholder={field.placeholder} />;
      break;
    case "bilingual-list":
      control = <BilingualList id={id} name={field.name} values={values} onChange={onChange} disabled={disabled}
        label={field.label} />;
      break;
    case "metrics":
      control = <MetricsEditor idPrefix={id} value={(values[field.name] as MetricValue[]) ?? []}
        onChange={(v) => onChange(field.name, v)} />;
      break;
  }

  const grouped =
    field.type === "bilingual-text" || field.type === "bilingual-textarea" || field.type === "bilingual-list" ||
    field.type === "metrics" || field.type === "image" || field.type === "tags";

  return (
    <div className="a-field" data-type={field.type} data-invalid={invalid ? "true" : undefined}>
      {grouped ? (
        <div className="a-label" id={`${id}-label`}>{field.label}{requiredMark}</div>
      ) : (
        <label className="a-label" htmlFor={id}>{field.label}{requiredMark}</label>
      )}
      {field.help ? <p className="a-help" id={helpId}>{field.help}</p> : null}
      {control}
      {error ? <p className="a-error" id={errId} role="alert">{error}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ tags */

function TagsInput({
  id, value, onChange, disabled, describedBy, placeholder,
}: {
  id: string; value: string[]; onChange: (v: string[]) => void; disabled?: boolean; describedBy?: string; placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit(raw: string) {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...value];
    for (const p of parts) if (!next.some((x) => x.toLowerCase() === p.toLowerCase())) next.push(p);
    onChange(next);
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="a-tags">
      {value.length > 0 ? (
        <ul className="a-tag-list" aria-label="Added items">
          {value.map((t) => (
            <li key={t} className="a-tag">
              <span>{t}</span>
              <button type="button" className="a-tag-x" disabled={disabled} onClick={() => onChange(value.filter((x) => x !== t))}
                aria-label={`Remove ${t}`}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="a-tag-add">
        <input id={id} className="a-input" value={draft} disabled={disabled} aria-describedby={describedBy}
          placeholder={placeholder ?? "Type one, then press Enter"} enterKeyHint="done"
          onChange={(e) => setDraft(e.target.value)} onKeyDown={onKeyDown} onBlur={() => commit(draft)} />
        <button type="button" className="a-btn a-btn-ghost" disabled={disabled || draft.trim() === ""} onClick={() => commit(draft)}>
          Add
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ bilingual */

function BilingualPair({
  id, kind, name, values, onChange, disabled, required, describedBy, invalid, errors, placeholder,
}: {
  id: string; kind: "text" | "textarea"; name: string; values: FormValues;
  onChange: (key: string, value: unknown) => void; disabled?: boolean; required?: boolean;
  describedBy?: string; invalid?: boolean; errors: Record<string, string>; placeholder?: string;
}) {
  const sides = [
    { key: `${name}_en`, label: "English", lang: "en" },
    { key: `${name}_ur`, label: "Roman Urdu", lang: "ur-Latn" },
  ];
  return (
    <div className="a-pair">
      {sides.map((s, i) => {
        const props = {
          id: i === 0 ? id : `${id}-ur`,
          className: "a-input",
          disabled,
          lang: s.lang,
          value: str(values[s.key]),
          placeholder,
          "aria-invalid": errors[s.key] ? true : invalid && i === 0 ? true : undefined,
          "aria-describedby": describedBy,
          required: required && i === 0,
          onChange: (e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => onChange(s.key, e.target.value),
        };
        return (
          <label key={s.key} className="a-sublabel" htmlFor={props.id}>
            {s.label}
            {kind === "textarea" ? <textarea {...props} rows={5} /> : <input {...props} type="text" />}
          </label>
        );
      })}
    </div>
  );
}

function BilingualList({
  id, name, values, onChange, disabled, label,
}: {
  id: string; name: string; values: FormValues; onChange: (key: string, value: unknown) => void; disabled?: boolean; label: string;
}) {
  const en = list(values[`${name}_en`]);
  const ur = list(values[`${name}_ur`]);
  const rows = Math.max(en.length, ur.length);
  const set = (i: number, side: "en" | "ur", v: string) => {
    const src = side === "en" ? [...en] : [...ur];
    while (src.length < rows) src.push("");
    src[i] = v;
    onChange(`${name}_${side}`, src);
  };
  const remove = (i: number) => {
    onChange(`${name}_en`, en.filter((_, idx) => idx !== i));
    onChange(`${name}_ur`, ur.filter((_, idx) => idx !== i));
  };
  const add = () => {
    onChange(`${name}_en`, [...en, ...Array(rows - en.length).fill(""), ""]);
    onChange(`${name}_ur`, [...ur, ...Array(rows - ur.length).fill(""), ""]);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rows) return;
    for (const side of ["en", "ur"] as const) {
      const src = side === "en" ? [...en] : [...ur];
      while (src.length < rows) src.push("");
      [src[i], src[j]] = [src[j], src[i]];
      onChange(`${name}_${side}`, src);
    }
  };

  return (
    <div className="a-stack">
      {rows === 0 ? <p className="a-help">No lines yet.</p> : null}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="a-listrow">
          <div className="a-pair">
            <label className="a-sublabel" htmlFor={`${id}-${i}-en`}>
              English, line {i + 1}
              <input id={`${id}-${i}-en`} className="a-input" lang="en" disabled={disabled} value={en[i] ?? ""}
                onChange={(e) => set(i, "en", e.target.value)} />
            </label>
            <label className="a-sublabel" htmlFor={`${id}-${i}-ur`}>
              Roman Urdu, line {i + 1}
              <input id={`${id}-${i}-ur`} className="a-input" lang="ur-Latn" disabled={disabled} value={ur[i] ?? ""}
                onChange={(e) => set(i, "ur", e.target.value)} />
            </label>
          </div>
          <div className="a-actions">
            <button type="button" className="a-btn a-btn-quiet" onClick={() => move(i, -1)} disabled={disabled || i === 0}
              aria-label={`Move ${label} line ${i + 1} up`}>Move up</button>
            <button type="button" className="a-btn a-btn-quiet" onClick={() => move(i, 1)} disabled={disabled || i === rows - 1}
              aria-label={`Move ${label} line ${i + 1} down`}>Move down</button>
            <button type="button" className="a-btn a-btn-quiet" onClick={() => remove(i)} disabled={disabled}
              aria-label={`Remove ${label} line ${i + 1}`}>Remove</button>
          </div>
        </div>
      ))}
      <div>
        <button type="button" className="a-btn a-btn-ghost" onClick={add} disabled={disabled}>Add line</button>
      </div>
    </div>
  );
}
