"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { buildWaLink, normalizeWaNumber } from "@/lib/whatsapp";
import { FieldRenderer } from "../kit/fields";
import { formKeys, validate, type FormValues } from "../kit/model";
import { explain } from "../kit/CrudForm";
import { revalidateTags } from "../kit/revalidate";
import { useToast } from "../kit/Toast";
import { SETTINGS_BOOLEANS, SETTINGS_CONFIG, SETTINGS_GROUPS } from "./settings-fields";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function emptyValues(): FormValues {
  const v: FormValues = {};
  for (const f of SETTINGS_CONFIG.fields) for (const k of formKeys(f)) v[k] = SETTINGS_BOOLEANS.has(k) ? false : "";
  return v;
}

export function SettingsEditor() {
  const toast = useToast();
  const supabase = useMemo(() => createClient(), []);
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase.from("site_settings").select("key, value");
      if (!alive) return;
      if (error) {
        setLoadError(explain(error));
      } else {
        const next = emptyValues();
        for (const row of (data ?? []) as { key: string; value: unknown }[]) {
          if (!(row.key in next)) continue;
          if (SETTINGS_BOOLEANS.has(row.key)) next[row.key] = row.value === true;
          else if (typeof row.value === "string") next[row.key] = row.value;
        }
        setValues(next);
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [supabase]);

  function change(key: string, value: unknown) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => { const { [key]: _x, ...rest } = e; void _x; return rest; });
  }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (saving) return;
    const found = validate(SETTINGS_CONFIG, values);
    const wa = String(values.whatsapp_number ?? "").trim();
    if (wa && !normalizeWaNumber(wa)) found.whatsapp_number = "Enter 8 to 15 digits including the country code, for example 923001234567.";
    const mail = String(values.email ?? "").trim();
    if (mail && !EMAIL_RE.test(mail)) found.email = "Enter a valid email address, or leave it empty.";
    if (Object.keys(found).length) {
      setErrors(found);
      toast.error("Some settings need attention. They are marked below.");
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setSaving(true);
    const upserts: { key: string; value: unknown }[] = [];
    const removes: string[] = [];
    for (const [key, raw] of Object.entries(values)) {
      if (SETTINGS_BOOLEANS.has(key)) upserts.push({ key, value: raw === true });
      else {
        const s = String(raw ?? "").trim();
        if (!s) removes.push(key);
        else upserts.push({ key, value: key === "whatsapp_number" ? normalizeWaNumber(s) || s : s });
      }
    }
    const up = await supabase.from("site_settings").upsert(upserts, { onConflict: "key" });
    const del = removes.length ? await supabase.from("site_settings").delete().in("key", removes) : { error: null };
    setSaving(false);
    const error = up.error ?? del.error;
    if (error) { toast.error(`Could not save: ${explain(error)}`); return; }
    const ok = await revalidateTags(["content:site_settings"]);
    toast[ok ? "success" : "info"](ok ? "Saved." : "Saved. Press Publish changes to refresh the public site now.");
  }

  if (loading) return <p className="a-text" role="status">Loading settings...</p>;
  if (loadError) return <p className="a-banner a-banner-error" role="alert">{loadError}</p>;

  const waLink = buildWaLink({ number: String(values.whatsapp_number ?? ""), message: String(values.whatsapp_default_message_en ?? "") });

  return (
    <form onSubmit={save} noValidate>
      {SETTINGS_GROUPS.map((g) => (
        <fieldset key={g.legend} className="a-fieldset">
          <legend>{g.legend}</legend>
          {g.intro ? <p className="a-help">{g.intro}</p> : null}
          {g.fields.map((f) => (
            <FieldRenderer key={f.name} field={f} values={values} errors={errors} onChange={change} disabled={saving} />
          ))}
          {g.legend === "Contact" ? (
            waLink ? (
              <p className="a-help">
                Test your number:{" "}
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  open WhatsApp chat<span className="a-sr-only"> (opens in a new tab)</span>
                </a>
              </p>
            ) : (
              <p className="a-banner a-banner-warn">No WhatsApp number yet, so every WhatsApp button is hidden on the public site.</p>
            )
          ) : null}
        </fieldset>
      ))}
      <div className="a-savebar">
        <button type="submit" className="a-btn a-btn-primary" disabled={saving}>{saving ? "Saving..." : "Save settings"}</button>
      </div>
    </form>
  );
}
