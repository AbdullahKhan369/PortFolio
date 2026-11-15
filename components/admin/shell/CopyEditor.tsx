"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { explain } from "../kit/CrudForm";
import { revalidateTags } from "../kit/revalidate";
import { useToast } from "../kit/Toast";

export interface CopyRow { key: string; en: string; ur: string }
export interface CopyGroup { ns: string; label: string; rows: CopyRow[] }
type Edits = Record<string, { en: string; ur: string }>;

const MAX_SEARCH_RESULTS = 40;

/** Edit any built-in sentence of the site. Only filled boxes are stored (table site_copy); empty means "use the built-in text". */
export function CopyEditor({ groups }: { groups: CopyGroup[] }) {
  const toast = useToast();
  const supabase = useMemo(() => createClient(), []);
  const [edits, setEdits] = useState<Edits>({});
  const [saved, setSaved] = useState<Edits>({});
  const [ns, setNs] = useState(groups[0]?.ns ?? "");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase.from("site_copy").select("key, value_en, value_ur");
      if (!alive) return;
      if (error) {
        setLoadError(
          /does not exist|schema cache|relation/i.test(error.message)
            ? "The Site text table is not in your database yet. Run supabase/seed/s7-admin.sql in the Supabase SQL editor, then reload this page."
            : explain(error),
        );
      } else {
        const next: Edits = {};
        for (const r of (data ?? []) as { key: string; value_en: string | null; value_ur: string | null }[]) next[r.key] = { en: r.value_en ?? "", ur: r.value_ur ?? "" };
        setEdits(next);
        setSaved(next);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [supabase]);

  const all = useMemo(() => groups.flatMap((g) => g.rows.map((r) => ({ ...r, ns: g.ns, id: `${g.ns}.${r.key}`, label: g.label }))), [groups]);
  const q = query.trim().toLowerCase();
  const shown = q
    ? all.filter((r) => r.id.toLowerCase().includes(q) || r.en.toLowerCase().includes(q) || (edits[r.id]?.en ?? "").toLowerCase().includes(q)).slice(0, MAX_SEARCH_RESULTS)
    : all.filter((r) => r.ns === ns);

  const isEdited = (id: string): boolean => !!(edits[id]?.en.trim() || edits[id]?.ur.trim());
  const countEdited = (nsKey: string): number => all.filter((r) => r.ns === nsKey && isEdited(r.id)).length;
  const dirty = JSON.stringify(normalize(edits)) !== JSON.stringify(normalize(saved));

  function set(id: string, lang: "en" | "ur", value: string) {
    setEdits((e) => ({ ...e, [id]: { en: e[id]?.en ?? "", ur: e[id]?.ur ?? "", [lang]: value } }));
  }
  function reset(id: string) {
    setEdits((e) => {
      const { [id]: _x, ...rest } = e;
      void _x;
      return rest;
    });
  }

  async function save() {
    if (saving) return;
    const final = normalize(edits);
    const before = normalize(saved);
    const upserts = Object.entries(final).map(([key, v]) => ({ key, value_en: v.en, value_ur: v.ur }));
    const removes = Object.keys(before).filter((k) => !(k in final));
    setSaving(true);
    const up = upserts.length ? await supabase.from("site_copy").upsert(upserts, { onConflict: "key" }) : { error: null };
    const del = removes.length ? await supabase.from("site_copy").delete().in("key", removes) : { error: null };
    setSaving(false);
    const error = up.error ?? del.error;
    if (error) {
      toast.error(`Could not save: ${explain(error)}`);
      return;
    }
    setSaved(final);
    const ok = await revalidateTags(["content:site_copy"]);
    toast[ok ? "success" : "info"](ok ? "Saved. The public site is updated." : "Saved. Press Publish changes to refresh the public site now.");
  }

  if (loading) return <p className="a-text" role="status">Loading site text...</p>;
  if (loadError) return <p className="a-banner a-banner-error" role="alert">{loadError}</p>;

  return (
    <div>
      <div className="a-toolbar">
        <label className="a-label" htmlFor="copy-search">Search all text</label>
        <input id="copy-search" type="search" className="a-input" placeholder="Search a word or a key, for example: availability" value={query} onChange={(e) => setQuery(e.target.value)} />
        {!q ? (
          <>
            <label className="a-label" htmlFor="copy-ns">Part of the site</label>
            <select id="copy-ns" className="a-input" value={ns} onChange={(e) => setNs(e.target.value)}>
              {groups.map((g) => (
                <option key={g.ns} value={g.ns}>
                  {g.label} ({g.rows.length}){countEdited(g.ns) ? ` - ${countEdited(g.ns)} edited` : ""}
                </option>
              ))}
            </select>
          </>
        ) : (
          <p className="a-help">Showing up to {MAX_SEARCH_RESULTS} matches across the whole site.</p>
        )}
      </div>

      <div className="a-stack">
        {shown.length === 0 ? <p className="a-empty">Nothing matches that search.</p> : null}
        {shown.map((r) => {
          const e = edits[r.id];
          return (
            <section key={r.id} className="a-panel" aria-label={r.id}>
              <div className="a-panel-head">
                <p className="a-panel-title">
                  <code className="a-code">{r.id}</code>
                  {q ? <span className="a-muted"> ({r.label})</span> : null}
                  {isEdited(r.id) ? <span className="a-tag"> edited</span> : null}
                </p>
                {isEdited(r.id) ? (
                  <button type="button" className="a-btn a-btn-quiet" onClick={() => reset(r.id)}>Use built-in text</button>
                ) : null}
              </div>
              <div className="a-panel-body a-pair">
                <div className="a-field">
                  <label className="a-label" htmlFor={`${r.id}-en`}>English</label>
                  <textarea id={`${r.id}-en`} className="a-input" rows={2} value={e?.en ?? ""} placeholder={r.en} onChange={(ev) => set(r.id, "en", ev.target.value)} />
                </div>
                <div className="a-field">
                  <label className="a-label" htmlFor={`${r.id}-ur`}>Roman Urdu</label>
                  <textarea id={`${r.id}-ur`} className="a-input a-ur" rows={2} value={e?.ur ?? ""} placeholder={r.ur || r.en} onChange={(ev) => set(r.id, "ur", ev.target.value)} />
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className="a-savebar">
        <button type="button" className="a-btn a-btn-primary" onClick={save} disabled={saving || !dirty}>
          {saving ? "Saving..." : dirty ? "Save site text" : "Nothing to save"}
        </button>
      </div>
    </div>
  );
}

/** Drops entries where both boxes are empty (those mean "use the built-in text") and trims the rest. */
function normalize(e: Edits): Edits {
  const out: Edits = {};
  for (const [k, v] of Object.entries(e)) {
    const en = v.en.trim();
    const ur = v.ur.trim();
    if (en || ur) out[k] = { en, ur };
  }
  return out;
}
