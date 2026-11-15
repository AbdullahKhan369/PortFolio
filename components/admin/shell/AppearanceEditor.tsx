"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { HEX_COLOR, HOME_SECTIONS, SECTION_LABELS, parseSectionLayout, type SectionSlot } from "@/lib/content/appearance";
import { FieldRenderer } from "../kit/fields";
import type { FieldDef } from "../kit/types";
import type { FormValues } from "../kit/model";
import { explain } from "../kit/CrudForm";
import { revalidateTags } from "../kit/revalidate";
import { useToast } from "../kit/Toast";

const COLOR_FIELDS: FieldDef[] = [
  { name: "theme_base", label: "Page background", type: "color", help: "Built-in: #12163A (deep navy). Keep it dark: all text is light." },
  { name: "theme_violet", label: "Violet accent", type: "color", help: "Built-in: #8A5CFF. Used for the first ray, buttons and highlights." },
  { name: "theme_azure", label: "Azure accent", type: "color", help: "Built-in: #3AA0FF." },
  { name: "theme_mint", label: "Mint accent", type: "color", help: "Built-in: #4FE3B0." },
  { name: "theme_amber", label: "Amber accent", type: "color", help: "Built-in: #FFC857." },
];
const FX_FIELDS: FieldDef[] = [
  { name: "fx_spine", label: "Light Spine (scroll beam on the left edge)", type: "boolean" },
  { name: "fx_grain", label: "Film grain over the background", type: "boolean" },
  { name: "fx_cursor", label: "Light orb cursor and mouse-following prism (desktop)", type: "boolean" },
  { name: "fx_intro", label: "Opening 3-6-9 intro", type: "boolean" },
  { name: "fx_webgl", label: "Real-time WebGL prism in the hero (the simple SVG prism is used when off)", type: "boolean" },
];
const COLOR_KEYS = COLOR_FIELDS.map((f) => f.name);
const FX_KEYS = FX_FIELDS.map((f) => f.name);

export function AppearanceEditor() {
  const toast = useToast();
  const supabase = useMemo(() => createClient(), []);
  const [values, setValues] = useState<FormValues>({});
  const [layout, setLayout] = useState<SectionSlot[]>(() => parseSectionLayout(undefined));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase.from("site_settings").select("key, value").in("key", [...COLOR_KEYS, ...FX_KEYS, "section_layout"]);
      if (!alive) return;
      if (error) {
        setLoadError(explain(error));
      } else {
        const next: FormValues = {};
        for (const k of FX_KEYS) next[k] = true; // effects are on unless switched off
        for (const k of COLOR_KEYS) next[k] = "";
        let rawLayout: string | undefined;
        for (const row of (data ?? []) as { key: string; value: unknown }[]) {
          if (FX_KEYS.includes(row.key)) next[row.key] = row.value !== false;
          else if (COLOR_KEYS.includes(row.key)) next[row.key] = typeof row.value === "string" ? row.value : "";
          else if (row.key === "section_layout" && typeof row.value === "string") rawLayout = row.value;
        }
        setValues(next);
        setLayout(parseSectionLayout(rawLayout));
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [supabase]);

  function change(key: string, value: unknown) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => {
      const { [key]: _x, ...rest } = e;
      void _x;
      return rest;
    });
  }
  function move(index: number, by: -1 | 1) {
    setLayout((l) => {
      const j = index + by;
      if (j < 0 || j >= l.length) return l;
      const next = [...l];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }
  function toggle(index: number) {
    setLayout((l) => l.map((s, i) => (i === index ? { ...s, visible: !s.visible } : s)));
  }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (saving) return;
    const found: Record<string, string> = {};
    for (const k of COLOR_KEYS) {
      const v = String(values[k] ?? "").trim();
      if (v && !HEX_COLOR.test(v)) found[k] = "Use a colour like #8A5CFF (six digits), or leave it empty for the built-in colour.";
    }
    if (Object.keys(found).length) {
      setErrors(found);
      toast.error("Some colours need attention. They are marked below.");
      return;
    }
    setSaving(true);
    const upserts: { key: string; value: unknown }[] = [];
    const removes: string[] = [];
    for (const k of COLOR_KEYS) {
      const v = String(values[k] ?? "").trim();
      if (v) upserts.push({ key: k, value: v.toUpperCase().replace(/^#/, "#") });
      else removes.push(k);
    }
    for (const k of FX_KEYS) upserts.push({ key: k, value: values[k] !== false });
    upserts.push({ key: "section_layout", value: JSON.stringify(layout) });
    const up = await supabase.from("site_settings").upsert(upserts, { onConflict: "key" });
    const del = removes.length ? await supabase.from("site_settings").delete().in("key", removes) : { error: null };
    setSaving(false);
    const error = up.error ?? del.error;
    if (error) {
      toast.error(`Could not save: ${explain(error)}`);
      return;
    }
    const ok = await revalidateTags(["content:site_settings"]);
    toast[ok ? "success" : "info"](ok ? "Saved. The public site is updated." : "Saved. Press Publish changes to refresh the public site now.");
  }

  if (loading) return <p className="a-text" role="status">Loading appearance...</p>;
  if (loadError) return <p className="a-banner a-banner-error" role="alert">{loadError}</p>;

  return (
    <form onSubmit={save} noValidate>
      <fieldset className="a-fieldset">
        <legend>Colours</legend>
        {COLOR_FIELDS.map((f) => (
          <FieldRenderer key={f.name} field={f} values={values} errors={errors} onChange={change} disabled={saving} />
        ))}
      </fieldset>

      <fieldset className="a-fieldset">
        <legend>Effects</legend>
        <p className="a-help">Phones and slow devices already get a lighter version automatically. Switch an effect off here to remove it for everyone.</p>
        {FX_FIELDS.map((f) => (
          <FieldRenderer key={f.name} field={f} values={values} errors={errors} onChange={change} disabled={saving} />
        ))}
      </fieldset>

      <fieldset className="a-fieldset">
        <legend>Home page sections</legend>
        <p className="a-help">The hero always stays first. Use the arrows to reorder, and untick a section to hide it from the home page (its content is kept).</p>
        <ol className="a-stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {layout.map((slot, i) => (
            <li key={slot.id} className="a-listrow">
              <label style={{ display: "flex", gap: "0.6rem", alignItems: "center", flex: 1 }}>
                <input type="checkbox" checked={slot.visible} onChange={() => toggle(i)} />
                <span>
                  {i + 1}. {SECTION_LABELS[slot.id]}
                  {slot.visible ? "" : " (hidden)"}
                </span>
              </label>
              <span className="a-actions">
                <button type="button" className="a-btn a-btn-quiet" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${SECTION_LABELS[slot.id]} up`}>Up</button>
                <button type="button" className="a-btn a-btn-quiet" onClick={() => move(i, 1)} disabled={i === layout.length - 1} aria-label={`Move ${SECTION_LABELS[slot.id]} down`}>Down</button>
              </span>
            </li>
          ))}
        </ol>
        <button type="button" className="a-btn a-btn-ghost" onClick={() => setLayout(HOME_SECTIONS.map((id) => ({ id, visible: true })))}>Reset order and show all</button>
      </fieldset>

      <div className="a-savebar">
        <button type="submit" className="a-btn a-btn-primary" disabled={saving}>{saving ? "Saving..." : "Save appearance"}</button>
      </div>
    </form>
  );
}
