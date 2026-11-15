"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { CrudConfig } from "./types";
import { toFormValues, toPayload, validate, type DbRow, type FormValues } from "./model";
import { FieldRenderer } from "./fields";

interface CrudFormProps {
  config: CrudConfig;
  /** Existing row (edit) or null (create). For create, extra columns such as order_index are added by the caller. */
  row: DbRow | null;
  /** Extra columns to insert with a new row (order_index, is_visible, duplicated values). */
  createExtras?: Record<string, unknown>;
  /** Start with these form values instead of the row/defaults (used by Duplicate). */
  initialValues?: FormValues;
  onSaved: (saved: DbRow, mode: "created" | "updated") => void;
  onCancel?: () => void;
  /** "inline": rendered in the page (single-row tables). Otherwise it sits inside a panel. */
  inline?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
  formId: string;
}

/** The create/edit form. Validates with zod, saves with the browser Supabase client (RLS enforces admin). */
export function CrudForm({
  config, row, createExtras, initialValues, onSaved, onCancel, inline, onDirtyChange, formId,
}: CrudFormProps) {
  const initial = useMemo(() => initialValues ?? toFormValues(config, row), [config, row, initialValues]);
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function change(key: string, value: unknown) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => {
      if (!e[key]) return e;
      const { [key]: _removed, ...rest } = e;
      void _removed;
      return rest;
    });
    onDirtyChange?.(true);
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (saving) return;
    setFormError(null);
    const found = validate(config, values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setFormError("Some fields need attention. They are marked below.");
      const firstKey = Object.keys(found)[0];
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>(`#${CSS.escape(formId)} [aria-invalid="true"]`)?.focus();
        void firstKey;
      });
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const payload = toPayload(config, values);
      if (row?.id) {
        const { data, error } = await supabase.from(config.table).update(payload).eq("id", row.id).select().single();
        if (error) throw error;
        onDirtyChange?.(false);
        onSaved(data as DbRow, "updated");
      } else {
        const { data, error } = await supabase
          .from(config.table)
          .insert({ ...payload, ...(createExtras ?? {}) })
          .select()
          .single();
        if (error) throw error;
        onDirtyChange?.(false);
        onSaved(data as DbRow, "created");
      }
    } catch (e) {
      setFormError(explain(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form id={formId} className="a-form" onSubmit={submit} noValidate>
      {formError ? <p className="a-banner a-banner-error" role="alert">{formError}</p> : null}
      <div className="a-form-fields">
        {config.fields.map((f) => (
          <FieldRenderer key={f.name} field={f} values={values} errors={errors} onChange={change} disabled={saving} />
        ))}
      </div>
      <div className={inline ? "a-savebar" : "a-actions a-form-actions"}>
        {onCancel ? (
          <button type="button" className="a-btn a-btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>
        ) : null}
        <button type="submit" className="a-btn a-btn-primary" disabled={saving}>
          {saving ? "Saving..." : row?.id ? "Save changes" : `Save ${config.singular.toLowerCase()}`}
        </button>
      </div>
    </form>
  );
}

/** Turn database errors into plain instructions. */
export function explain(e: unknown): string {
  const err = e as { message?: string; code?: string } | null;
  const msg = err?.message ?? "";
  const code = err?.code ?? "";
  if (code === "23505" || /duplicate key/i.test(msg)) return "That value is already used by another entry. Change it (for example the slug or key) and save again.";
  if (code === "42501" || /row-level security|permission denied/i.test(msg)) return "You are signed out or not an admin. Sign in again, then save.";
  if (code === "23514" || /violates check constraint/i.test(msg)) return "One value is not allowed by the database (for example a link without https://). Check the fields and save again.";
  if (code === "23502") return "A required field is empty. Fill it in and save again.";
  if (/failed to fetch|network/i.test(msg)) return "Could not reach the server. Check your connection and save again.";
  return msg ? `Could not save: ${msg}` : "Could not save. Try again.";
}
