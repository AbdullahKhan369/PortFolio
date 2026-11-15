"use client";
// Nested editor for system_nodes: place nodes on a canvas and edit key, labels, kind and description.
// Renaming a key also updates the edges that used the old key, so the map never breaks.
import { useCallback, useEffect, useState } from "react";
import { getDb, revalidate } from "./db";
import NodePlacer from "./NodePlacer";
import { btnCls, btnPrimaryCls, dangerCls, Field, inputCls, Panel, StatusLine, SystemPicker, useStatus, useSystems } from "./ui";

type Kind = "service" | "db" | "ai" | "queue" | "client" | "api" | "other";
interface NodeRow {
  id: string;
  system_id: string;
  key: string;
  label_en: string;
  label_ur: string;
  kind: Kind;
  description_en: string | null;
  description_ur: string | null;
  x: number;
  y: number;
  is_visible: boolean;
  order_index: number;
}
interface EdgeLite {
  from_key: string;
  to_key: string;
}

const KINDS: { value: Kind; label: string }[] = [
  { value: "client", label: "Person or app (circle with ring)" },
  { value: "service", label: "Service (circle)" },
  { value: "api", label: "Outside service (hexagon)" },
  { value: "queue", label: "Queue (pill)" },
  { value: "db", label: "Database (rounded box)" },
  { value: "ai", label: "AI step (diamond). Use only where AI is really used" },
  { value: "other", label: "Other (dashed circle)" },
];
const TAGS = ["content:system_nodes", "content:systems"];
const KEY_RE = /^[a-z0-9][a-z0-9-]*$/;

export default function SystemNodesEditor() {
  const { systems, systemId, setSystemId, error } = useSystems();
  const [rows, setRows] = useState<NodeRow[]>([]);
  const [origKeys, setOrigKeys] = useState<Record<string, string>>({});
  const [edges, setEdges] = useState<EdgeLite[]>([]);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { status, ok, err, clear } = useStatus();

  const load = useCallback(
    async (id: string) => {
      if (!id) return setRows([]);
      const db = getDb();
      const [n, e] = await Promise.all([
        db.from("system_nodes").select("*").eq("system_id", id).order("order_index", { ascending: true }),
        db.from("system_edges").select("from_key,to_key").eq("system_id", id),
      ]);
      if (n.error) return err(n.error.message);
      const list = (n.data ?? []) as NodeRow[];
      setRows(list);
      setOrigKeys(Object.fromEntries(list.map((r) => [r.id, r.key])));
      setEdges((e.data ?? []) as EdgeLite[]);
      setDirty(new Set());
      setSelected((cur) => (list.some((r) => r.key === cur) ? cur : list[0]?.key ?? null));
    },
    [err],
  );

  useEffect(() => {
    clear();
    void load(systemId);
  }, [systemId, load, clear]);

  useEffect(() => {
    if (error) err(error);
  }, [error, err]);

  const edit = (id: string, patch: Partial<NodeRow>) => {
    setRows((cur) => cur.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setDirty((cur) => new Set(cur).add(id));
  };

  const moveNode = (key: string, x: number, y: number) => {
    const r = rows.find((n) => n.key === key);
    if (r) edit(r.id, { x, y });
  };

  async function add() {
    if (!systemId) return;
    setBusy(true);
    let n = rows.length + 1;
    while (rows.some((r) => r.key === `node-${n}`)) n++;
    const next = rows.length ? Math.max(...rows.map((r) => r.order_index)) + 1 : 0;
    const { error: e } = await getDb().from("system_nodes").insert({
      system_id: systemId, key: `node-${n}`, label_en: "New node", label_ur: "Naya node", kind: "service", x: 50, y: 50, order_index: next, is_visible: true,
    });
    setBusy(false);
    if (e) return err(e.message);
    await revalidate(TAGS);
    await load(systemId);
    ok("Node added. Give it a key and labels, then save.");
  }

  async function save(row: NodeRow) {
    const key = row.key.trim();
    if (!KEY_RE.test(key)) return err("Key must be lowercase letters, numbers and hyphens, for example contact-lists.");
    if (rows.some((r) => r.id !== row.id && r.key === key)) return err("Another node in this system already uses that key.");
    if (!row.label_en.trim()) return err("English label is required.");
    setBusy(true);
    const db = getDb();
    const { error: e } = await db
      .from("system_nodes")
      .update({
        key, label_en: row.label_en.trim(), label_ur: row.label_ur.trim() || row.label_en.trim(), kind: row.kind,
        description_en: row.description_en?.trim() || null, description_ur: row.description_ur?.trim() || null,
        x: Math.min(100, Math.max(0, Number(row.x) || 0)), y: Math.min(100, Math.max(0, Number(row.y) || 0)), is_visible: row.is_visible,
      })
      .eq("id", row.id);
    if (e) {
      setBusy(false);
      return err(e.message);
    }
    const old = origKeys[row.id];
    if (old && old !== key) {
      const a = await db.from("system_edges").update({ from_key: key }).eq("system_id", systemId).eq("from_key", old);
      const b = await db.from("system_edges").update({ to_key: key }).eq("system_id", systemId).eq("to_key", old);
      if (a.error || b.error) err("Node saved, but its connections could not be renamed. Check the Connections editor.");
    }
    setBusy(false);
    await revalidate([...TAGS, "content:system_edges"]);
    await load(systemId);
    ok("Saved.");
  }

  async function remove(row: NodeRow) {
    const used = edges.filter((e) => e.from_key === row.key || e.to_key === row.key).length;
    const msg = used ? `Delete "${row.label_en}"? ${used} connection(s) use it and will be deleted too.` : `Delete "${row.label_en}"?`;
    if (!window.confirm(msg)) return;
    setBusy(true);
    const db = getDb();
    if (used) {
      await db.from("system_edges").delete().eq("system_id", systemId).eq("from_key", row.key);
      await db.from("system_edges").delete().eq("system_id", systemId).eq("to_key", row.key);
    }
    const { error: e } = await db.from("system_nodes").delete().eq("id", row.id);
    setBusy(false);
    if (e) return err(e.message);
    await revalidate([...TAGS, "content:system_edges"]);
    await load(systemId);
    ok("Deleted.");
  }

  async function move(i: number, dir: -1 | 1) {
    const a = rows[i];
    const b = rows[i + dir];
    if (!a || !b) return;
    const db = getDb();
    const r1 = await db.from("system_nodes").update({ order_index: b.order_index }).eq("id", a.id);
    const r2 = await db.from("system_nodes").update({ order_index: a.order_index }).eq("id", b.id);
    if (r1.error || r2.error) return err((r1.error ?? r2.error)?.message ?? "Could not reorder.");
    await revalidate(TAGS);
    await load(systemId);
  }

  return (
    <Panel title="System nodes" intro="The parts of a system. Place them on the canvas, then save each node. A node of kind AI is shown with an AI marker, so use it only where AI is genuinely used.">
      <SystemPicker systems={systems} value={systemId} onChange={setSystemId} />
      <StatusLine status={status} />

      {rows.length > 0 && (
        <NodePlacer nodes={rows.map((r) => ({ key: r.key, label: r.label_en, x: Number(r.x), y: Number(r.y) }))} edges={edges} selectedKey={selected} onSelect={setSelected} onMove={moveNode} />
      )}

      <div>
        <button type="button" className={btnCls} disabled={busy || !systemId} onClick={() => void add()}>
          Add node
        </button>
      </div>

      <ul className="grid gap-4">
        {rows.map((r, i) => (
          <li key={r.id} className={`grid gap-3 rounded-lg border p-4 ${selected === r.key ? "border-blue-500" : "border-current/25"}`} onFocusCapture={() => setSelected(r.key)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Key" help="Used by connections. Renaming it updates them.">
                <input className={inputCls} value={r.key} onChange={(e) => edit(r.id, { key: e.target.value })} />
              </Field>
              <Field label="Kind">
                <select className={inputCls} value={r.kind} onChange={(e) => edit(r.id, { kind: e.target.value as Kind })}>
                  {KINDS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Label (English)">
                <input className={inputCls} value={r.label_en} onChange={(e) => edit(r.id, { label_en: e.target.value })} />
              </Field>
              <Field label="Label (Roman Urdu)">
                <input className={inputCls} value={r.label_ur} onChange={(e) => edit(r.id, { label_ur: e.target.value })} />
              </Field>
              <Field label="Description (English)">
                <textarea className={inputCls} rows={3} value={r.description_en ?? ""} onChange={(e) => edit(r.id, { description_en: e.target.value })} />
              </Field>
              <Field label="Description (Roman Urdu)">
                <textarea className={inputCls} rows={3} value={r.description_ur ?? ""} onChange={(e) => edit(r.id, { description_ur: e.target.value })} />
              </Field>
              <Field label="X (0 to 100)">
                <input className={inputCls} type="number" min={0} max={100} step={0.5} inputMode="decimal" value={r.x} onChange={(e) => edit(r.id, { x: Number(e.target.value) })} />
              </Field>
              <Field label="Y (0 to 100)">
                <input className={inputCls} type="number" min={0} max={100} step={0.5} inputMode="decimal" value={r.y} onChange={(e) => edit(r.id, { y: Number(e.target.value) })} />
              </Field>
            </div>
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input type="checkbox" className="h-5 w-5" checked={r.is_visible} onChange={(e) => edit(r.id, { is_visible: e.target.checked })} />
              Show on the public site
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={btnPrimaryCls} disabled={busy || !dirty.has(r.id)} onClick={() => void save(r)}>
                {dirty.has(r.id) ? "Save node" : "Saved"}
              </button>
              <button type="button" className={btnCls} disabled={busy || i === 0} onClick={() => void move(i, -1)}>
                Move up
              </button>
              <button type="button" className={btnCls} disabled={busy || i === rows.length - 1} onClick={() => void move(i, 1)}>
                Move down
              </button>
              <button type="button" className={dangerCls} disabled={busy} onClick={() => void remove(r)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
