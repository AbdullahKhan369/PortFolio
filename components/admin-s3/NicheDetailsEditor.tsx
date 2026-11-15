"use client";
// Nested editor for niche_templates fields the generic CRUD kit cannot edit (palette and sample_items are jsonb),
// plus an "Add a niche" form that inserts a complete row (key, labels, headlines, palette, items).
import { useCallback, useEffect, useState } from "react";
import { contrastRatio, normalizeHex, safePalette } from "@/components/work/utils";
import { getDb, revalidate, slugify } from "./db";
import { btnCls, btnPrimaryCls, dangerCls, Field, inputCls, Panel, StatusLine, useStatus } from "./ui";

interface Item {
  name_en: string;
  name_ur: string;
  price?: string;
}
interface Niche {
  id: string;
  key: string;
  label_en: string;
  palette: { bg: string; fg: string; accent: string };
  sample_items: Item[];
}
const TAGS = ["content:niche_templates"];

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <input type="color" aria-label={`${label} picker`} className="h-11 w-14 shrink-0 rounded-md border border-current/30 bg-transparent p-1" value={normalizeHex(value, "#000000")} onChange={(e) => onChange(e.target.value)} />
        <input className={inputCls} value={value} maxLength={7} onChange={(e) => onChange(e.target.value)} onBlur={() => onChange(normalizeHex(value, "#000000"))} />
      </div>
    </Field>
  );
}

export default function NicheDetailsEditor() {
  const [niches, setNiches] = useState<Niche[]>([]);
  const [id, setId] = useState("");
  const [palette, setPalette] = useState({ bg: "#F2F4FF", fg: "#12163A", accent: "#7A4AF0" });
  const [items, setItems] = useState<Item[]>([]);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const { status, ok, err, clear } = useStatus();

  const [nk, setNk] = useState("");
  const [nle, setNle] = useState("");
  const [nlu, setNlu] = useState("");
  const [nhe, setNhe] = useState("");
  const [nhu, setNhu] = useState("");

  const load = useCallback(
    async (keepId?: string) => {
      const { data, error } = await getDb().from("niche_templates").select("id,key,label_en,palette,sample_items").order("order_index", { ascending: true });
      if (error) return err(error.message);
      const list = ((data ?? []) as Niche[]).map((n) => ({ ...n, palette: safePalette(n.palette), sample_items: Array.isArray(n.sample_items) ? n.sample_items : [] }));
      setNiches(list);
      const pick = list.find((n) => n.id === (keepId ?? id)) ?? list[0];
      if (pick) {
        setId(pick.id);
        setPalette(pick.palette);
        setItems(pick.sample_items);
        setDirty(false);
      }
    },
    [err, id],
  );

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (nid: string) => {
    const n = niches.find((x) => x.id === nid);
    if (!n) return;
    setId(nid);
    setPalette(n.palette);
    setItems(n.sample_items);
    setDirty(false);
    clear();
  };

  const setP = (k: "bg" | "fg" | "accent", v: string) => {
    setPalette((p) => ({ ...p, [k]: v }));
    setDirty(true);
  };
  const setItem = (i: number, patch: Partial<Item>) => {
    setItems((cur) => cur.map((it, k) => (k === i ? { ...it, ...patch } : it)));
    setDirty(true);
  };

  const textRatio = contrastRatio(palette.fg, palette.bg);
  const accentRatio = contrastRatio(palette.accent, palette.bg);

  async function save() {
    const clean = items
      .map((it) => ({ name_en: it.name_en.trim(), name_ur: (it.name_ur || it.name_en).trim(), ...(it.price && it.price.trim() ? { price: it.price.trim() } : {}) }))
      .filter((it) => it.name_en);
    const pal = { bg: normalizeHex(palette.bg), fg: normalizeHex(palette.fg), accent: normalizeHex(palette.accent) };
    setBusy(true);
    const { error } = await getDb().from("niche_templates").update({ palette: pal, sample_items: clean }).eq("id", id);
    setBusy(false);
    if (error) return err(error.message);
    await revalidate(TAGS);
    await load(id);
    ok("Saved.");
  }

  async function create() {
    const key = slugify(nk);
    if (!key) return err("Enter a key such as bakery or gym.");
    if (!nle.trim()) return err("English label is required.");
    if (niches.some((n) => n.key === key)) return err("A niche with that key already exists.");
    setBusy(true);
    const next = niches.length ? niches.length : 0;
    const { data, error } = await getDb()
      .from("niche_templates")
      .insert({
        key, label_en: nle.trim(), label_ur: nlu.trim() || nle.trim(), headline_en: nhe.trim() || nle.trim(), headline_ur: nhu.trim() || nhe.trim() || nle.trim(),
        palette: { bg: "#F2F4FF", fg: "#12163A", accent: "#7A4AF0" }, sample_items: [], order_index: next, is_visible: true,
      })
      .select("id")
      .single();
    setBusy(false);
    if (error) return err(error.message);
    setNk(""); setNle(""); setNlu(""); setNhe(""); setNhu("");
    await revalidate(TAGS);
    await load((data as { id: string } | null)?.id);
    ok("Niche added. Set its colours and sample items above.");
  }

  return (
    <Panel title="Niche colours and sample items" intro="Colours and items shown in the sample homepage on the site. Prices are optional: leave a price empty and it is not shown.">
      <StatusLine status={status} />

      <Field label="Niche">
        <select className={inputCls} value={id} onChange={(e) => choose(e.target.value)}>
          {niches.length === 0 && <option value="">No niches yet. Add one below.</option>}
          {niches.map((n) => (
            <option key={n.id} value={n.id}>
              {n.label_en} ({n.key})
            </option>
          ))}
        </select>
      </Field>

      {id && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <ColorField label="Background" value={palette.bg} onChange={(v) => setP("bg", v)} />
            <ColorField label="Text" value={palette.fg} onChange={(v) => setP("fg", v)} />
            <ColorField label="Accent (button, prices)" value={palette.accent} onChange={(v) => setP("accent", v)} />
          </div>
          <div className="rounded-lg p-4" style={{ background: normalizeHex(palette.bg), color: normalizeHex(palette.fg) }}>
            <p className="text-lg font-bold">Preview headline</p>
            <span className="mt-2 inline-block rounded-full px-4 py-2 text-sm font-semibold" style={{ background: normalizeHex(palette.accent), color: contrastRatio(palette.accent, "#12163A") >= contrastRatio(palette.accent, "#FFFFFF") ? "#12163A" : "#FFFFFF" }}>
              Order on WhatsApp
            </span>
          </div>
          {textRatio < 4.5 && <p className="text-sm text-red-500">Text on background has a contrast of {textRatio.toFixed(1)}:1. Aim for 4.5:1 or more so it stays readable.</p>}
          {accentRatio < 3 && <p className="text-sm text-red-500">Accent on background has a contrast of {accentRatio.toFixed(1)}:1. Aim for 3:1 or more.</p>}

          <h3 className="mt-2 text-base font-semibold">Sample items</h3>
          <ul className="grid gap-3">
            {items.map((it, i) => (
              <li key={i} className="grid gap-3 rounded-lg border border-current/25 p-3 sm:grid-cols-3">
                <Field label="Name (English)">
                  <input className={inputCls} value={it.name_en} onChange={(e) => setItem(i, { name_en: e.target.value })} />
                </Field>
                <Field label="Name (Roman Urdu)">
                  <input className={inputCls} value={it.name_ur} onChange={(e) => setItem(i, { name_ur: e.target.value })} />
                </Field>
                <Field label="Price (optional)">
                  <input className={inputCls} value={it.price ?? ""} placeholder="Leave empty to hide" onChange={(e) => setItem(i, { price: e.target.value })} />
                </Field>
                <div className="flex flex-wrap gap-2 sm:col-span-3">
                  <button type="button" className={btnCls} disabled={i === 0} onClick={() => { setItems((c) => { const n = [...c]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; }); setDirty(true); }}>
                    Move up
                  </button>
                  <button type="button" className={btnCls} disabled={i === items.length - 1} onClick={() => { setItems((c) => { const n = [...c]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; return n; }); setDirty(true); }}>
                    Move down
                  </button>
                  <button type="button" className={dangerCls} onClick={() => { setItems((c) => c.filter((_, k) => k !== i)); setDirty(true); }}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnCls} disabled={items.length >= 8} onClick={() => { setItems((c) => [...c, { name_en: "", name_ur: "" }]); setDirty(true); }}>
              Add item
            </button>
            <button type="button" className={btnPrimaryCls} disabled={busy || !dirty} onClick={() => void save()}>
              {dirty ? "Save colours and items" : "Saved"}
            </button>
          </div>
        </>
      )}

      <div className="mt-6 grid gap-3 rounded-lg border border-current/25 p-4">
        <h3 className="text-base font-semibold">Add a niche</h3>
        <p className="text-sm opacity-75">Use this to create a new niche with colours and items. The list above can then edit its labels and headlines.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Key" help="Lowercase, for example bakery">
            <input className={inputCls} value={nk} onChange={(e) => setNk(e.target.value)} />
          </Field>
          <span />
          <Field label="Label (English)">
            <input className={inputCls} value={nle} onChange={(e) => setNle(e.target.value)} />
          </Field>
          <Field label="Label (Roman Urdu)">
            <input className={inputCls} value={nlu} onChange={(e) => setNlu(e.target.value)} />
          </Field>
          <Field label="Sample headline (English)">
            <input className={inputCls} value={nhe} onChange={(e) => setNhe(e.target.value)} />
          </Field>
          <Field label="Sample headline (Roman Urdu)">
            <input className={inputCls} value={nhu} onChange={(e) => setNhu(e.target.value)} />
          </Field>
        </div>
        <div>
          <button type="button" className={btnPrimaryCls} disabled={busy} onClick={() => void create()}>
            Add niche
          </button>
        </div>
      </div>
    </Panel>
  );
}
