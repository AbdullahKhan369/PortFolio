"use client";
// Nested editor for system_edges (the arrows between nodes). From/to are chosen from the system's own node keys.
import { useCallback, useEffect, useState } from "react";
import { getDb, revalidate } from "./db";
import { btnCls, btnPrimaryCls, dangerCls, Field, inputCls, Panel, StatusLine, SystemPicker, useStatus, useSystems } from "./ui";

interface EdgeRow {
  id: string;
  system_id: string;
  from_key: string;
  to_key: string;
  label_en: string | null;
  label_ur: string | null;
  is_visible: boolean;
  order_index: number;
}
interface NodeLite {
  key: string;
  label_en: string;
}
const TAGS = ["content:system_edges", "content:systems"];

export default function SystemEdgesEditor() {
  const { systems, systemId, setSystemId, error } = useSystems();
  const [rows, setRows] = useState<EdgeRow[]>([]);
  const [nodes, setNodes] = useState<NodeLite[]>([]);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const { status, ok, err, clear } = useStatus();

  const load = useCallback(
    async (id: string) => {
      if (!id) {
        setRows([]);
        return setNodes([]);
      }
      const db = getDb();
      const [e, n] = await Promise.all([
        db.from("system_edges").select("*").eq("system_id", id).order("order_index", { ascending: true }),
        db.from("system_nodes").select("key,label_en").eq("system_id", id).order("order_index", { ascending: true }),
      ]);
      if (e.error) return err(e.error.message);
      setRows((e.data ?? []) as EdgeRow[]);
      setNodes((n.data ?? []) as NodeLite[]);
      setDirty(new Set());
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

  const keys = new Set(nodes.map((n) => n.key));
  const edit = (id: string, patch: Partial<EdgeRow>) => {
    setRows((cur) => cur.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setDirty((cur) => new Set(cur).add(id));
  };

  async function add() {
    if (nodes.length < 2) return err("Add at least two nodes first.");
    setBusy(true);
    const next = rows.length ? Math.max(...rows.map((r) => r.order_index)) + 1 : 0;
    const { error: e } = await getDb().from("system_edges").insert({ system_id: systemId, from_key: nodes[0].key, to_key: nodes[1].key, order_index: next, is_visible: true });
    setBusy(false);
    if (e) return err(e.message);
    await revalidate(TAGS);
    await load(systemId);
    ok("Connection added. Choose where it starts and ends, then save.");
  }

  async function save(r: EdgeRow) {
    if (!keys.has(r.from_key) || !keys.has(r.to_key)) return err("Both ends must be existing nodes.");
    if (r.from_key === r.to_key) return err("A connection cannot start and end on the same node.");
    setBusy(true);
    const { error: e } = await getDb()
      .from("system_edges")
      .update({ from_key: r.from_key, to_key: r.to_key, label_en: r.label_en?.trim() || null, label_ur: r.label_ur?.trim() || null, is_visible: r.is_visible })
      .eq("id", r.id);
    setBusy(false);
    if (e) return err(e.message);
    await revalidate(TAGS);
    await load(systemId);
    ok("Saved.");
  }

  async function remove(r: EdgeRow) {
    if (!window.confirm("Delete this connection?")) return;
    setBusy(true);
    const { error: e } = await getDb().from("system_edges").delete().eq("id", r.id);
    setBusy(false);
    if (e) return err(e.message);
    await revalidate(TAGS);
    await load(systemId);
    ok("Deleted.");
  }

  async function move(i: number, dir: -1 | 1) {
    const a = rows[i];
    const b = rows[i + dir];
    if (!a || !b) return;
    const db = getDb();
    const r1 = await db.from("system_edges").update({ order_index: b.order_index }).eq("id", a.id);
    const r2 = await db.from("system_edges").update({ order_index: a.order_index }).eq("id", b.id);
    if (r1.error || r2.error) return err((r1.error ?? r2.error)?.message ?? "Could not reorder.");
    await revalidate(TAGS);
    await load(systemId);
  }

  const nodeOptions = (current: string) => (
    <>
      {!keys.has(current) && <option value={current}>{current} (missing node)</option>}
      {nodes.map((n) => (
        <option key={n.key} value={n.key}>
          {n.label_en} ({n.key})
        </option>
      ))}
    </>
  );

  return (
    <Panel title="System connections" intro="The arrows between nodes. A connection points from one node to another. The label is optional and short.">
      <SystemPicker systems={systems} value={systemId} onChange={setSystemId} />
      <StatusLine status={status} />
      <div>
        <button type="button" className={btnCls} disabled={busy || !systemId} onClick={() => void add()}>
          Add connection
        </button>
      </div>
      {rows.length === 0 && <p className="text-sm opacity-75">No connections in this system yet.</p>}
      <ul className="grid gap-4">
        {rows.map((r, i) => {
          const broken = !keys.has(r.from_key) || !keys.has(r.to_key);
          return (
            <li key={r.id} className={`grid gap-3 rounded-lg border p-4 ${broken ? "border-red-500/70" : "border-current/25"}`}>
              {broken && <p className="text-sm text-red-500">One end of this connection points at a node that no longer exists. It is hidden on the public site until you fix it.</p>}
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="From">
                  <select className={inputCls} value={r.from_key} onChange={(e) => edit(r.id, { from_key: e.target.value })}>
                    {nodeOptions(r.from_key)}
                  </select>
                </Field>
                <Field label="To">
                  <select className={inputCls} value={r.to_key} onChange={(e) => edit(r.id, { to_key: e.target.value })}>
                    {nodeOptions(r.to_key)}
                  </select>
                </Field>
                <Field label="Label (English, optional)">
                  <input className={inputCls} value={r.label_en ?? ""} onChange={(e) => edit(r.id, { label_en: e.target.value })} />
                </Field>
                <Field label="Label (Roman Urdu, optional)">
                  <input className={inputCls} value={r.label_ur ?? ""} onChange={(e) => edit(r.id, { label_ur: e.target.value })} />
                </Field>
              </div>
              <label className="flex min-h-11 items-center gap-3 text-sm">
                <input type="checkbox" className="h-5 w-5" checked={r.is_visible} onChange={(e) => edit(r.id, { is_visible: e.target.checked })} />
                Show on the public site
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={btnPrimaryCls} disabled={busy || !dirty.has(r.id)} onClick={() => void save(r)}>
                  {dirty.has(r.id) ? "Save connection" : "Saved"}
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
          );
        })}
      </ul>
    </Panel>
  );
}
