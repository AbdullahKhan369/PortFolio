"use client";

import { useCallback, useContext, useEffect, useId, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { CrudConfig, FieldDef } from "./types";
import { cellText, matchesQuery, rowTitle, toFormValues, type DbRow, type FormValues } from "./model";
import { CrudForm, explain } from "./CrudForm";
import { ConfirmDialog } from "./ConfirmDialog";
import { Menu } from "./Menu";
import { Modal } from "./Modal";
import { ToastContext, ToastProvider, useToast } from "./Toast";
import { moveItem, useReorder } from "./useReorder";
import { revalidateTags } from "./revalidate";

type Editing = { kind: "new"; initial?: FormValues; extras?: Record<string, unknown> } | { kind: "edit"; row: DbRow } | null;

/** List, create, edit, delete, duplicate, reorder, show/hide, toasts and confirm for one table. */
export function CrudPage({ config }: { config: CrudConfig }) {
  const hasToasts = useContext(ToastContext);
  const body = <CrudInner config={config} />;
  return hasToasts ? body : <ToastProvider>{body}</ToastProvider>;
}

function CrudInner({ config }: { config: CrudConfig }) {
  const toast = useToast();
  const supabase = useMemo(() => createClient(), []);
  const orderable = config.orderable !== false && !config.singleRow;
  const hasVisibility = config.hasVisibility !== false;
  const formId = useId().replace(/:/g, "");

  const [rows, setRows] = useState<DbRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Editing>(null);
  const [dirty, setDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [toDelete, setToDelete] = useState<DbRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const columns = useMemo(
    () => config.tableColumns.map((n) => config.fields.find((f) => f.name === n)).filter((f): f is FieldDef => !!f),
    [config],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    let q = supabase.from(config.table).select("*");
    q = orderable ? q.order("order_index", { ascending: true }).order("created_at", { ascending: true }) : q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) setLoadError(explain(error));
    else setRows((data ?? []) as DbRow[]);
    setLoading(false);
  }, [supabase, config.table, orderable]);

  useEffect(() => {
    void load();
  }, [load]);

  const publish = useCallback(
    async (message: string) => {
      const ok = await revalidateTags([config.tag]);
      if (ok) toast.success(message);
      else toast.info(`${message} The public site may take up to an hour to update. Use Publish changes to refresh it now.`);
    },
    [config.tag, toast],
  );

  const visibleRows = useMemo(() => rows.filter((r) => matchesQuery(config, r, query)), [rows, config, query]);
  const searching = query.trim() !== "";

  /* ---------- mutations ---------- */

  const reorder = useReorder(visibleRows, orderable && !searching, (next) => void commitOrder(next));

  async function commitOrder(next: DbRow[]) {
    const previous = rows;
    const updated = next.map((r, i) => ({ ...r, order_index: i * 10 }));
    setRows(updated);
    const changed = updated.filter((r, i) => (previous.find((p) => p.id === r.id)?.order_index ?? -1) !== i * 10);
    const results = await Promise.all(
      changed.map((r) => supabase.from(config.table).update({ order_index: r.order_index }).eq("id", r.id as string)),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      setRows(previous);
      toast.error(`Could not reorder: ${explain(failed.error)}`);
      return;
    }
    await publish("Order saved.");
  }

  function moveRow(row: DbRow, dir: -1 | 1) {
    const i = rows.findIndex((r) => r.id === row.id);
    void commitOrder(moveItem(rows, i, i + dir));
  }

  async function toggleVisible(row: DbRow) {
    const next = !(row.is_visible === true);
    setBusyId(row.id as string);
    setRows((list) => list.map((r) => (r.id === row.id ? { ...r, is_visible: next } : r)));
    const { error } = await supabase.from(config.table).update({ is_visible: next }).eq("id", row.id as string);
    setBusyId(null);
    if (error) {
      setRows((list) => list.map((r) => (r.id === row.id ? { ...r, is_visible: !next } : r)));
      toast.error(`Could not change visibility: ${explain(error)}`);
      return;
    }
    await publish(next ? "Shown on the site." : "Hidden from the site.");
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const { error } = await supabase.from(config.table).delete().eq("id", toDelete.id as string);
    setDeleting(false);
    if (error) {
      toast.error(`Could not delete: ${explain(error)}`);
      return;
    }
    setRows((list) => list.filter((r) => r.id !== toDelete.id));
    setToDelete(null);
    await publish("Deleted.");
  }

  function duplicate(row: DbRow) {
    const values = toFormValues(config, row);
    const firstText = config.fields.find((f) => f.type === "bilingual-text" || f.type === "text");
    if (firstText) {
      const key = firstText.type === "bilingual-text" ? `${firstText.name}_en` : firstText.name;
      if (typeof values[key] === "string" && values[key]) values[key] = `${values[key]} (copy)`;
    }
    for (const f of config.fields) {
      if (f.name === "slug" || f.name === "key") {
        values[f.name] = `${String(values[f.name] ?? "")}-copy-${Math.random().toString(36).slice(2, 5)}`;
      }
    }
    setEditing({
      kind: "new",
      initial: values,
      extras: { is_visible: false, order_index: nextOrder() },
    });
    toast.info("Copy opened. It stays hidden until you show it.");
  }

  function nextOrder() {
    return rows.reduce((max, r) => Math.max(max, Number(r.order_index ?? 0)), -10) + 10;
  }

  function startNew() {
    const extras: Record<string, unknown> = {};
    if (orderable) extras.order_index = nextOrder();
    setEditing({ kind: "new", extras });
  }

  function onSaved(saved: DbRow, mode: "created" | "updated") {
    setRows((list) =>
      mode === "created" ? [...list, saved] : list.map((r) => (r.id === saved.id ? saved : r)),
    );
    setDirty(false);
    if (!config.singleRow) setEditing(null);
    void publish(mode === "created" ? "Saved." : "Saved.");
  }

  function requestClose() {
    if (dirty) setConfirmClose(true);
    else setEditing(null);
  }

  /* ---------- render ---------- */

  if (loading) {
    return <p className="a-text" role="status">Loading {config.title.toLowerCase()}...</p>;
  }
  if (loadError) {
    return (
      <div className="a-banner a-banner-error" role="alert">
        <p>{loadError}</p>
        <button type="button" className="a-btn a-btn-ghost" onClick={() => void load()}>Try again</button>
      </div>
    );
  }

  if (config.singleRow) {
    const row = rows[0] ?? null;
    return (
      <section aria-label={config.title}>
        {row ? null : <p className="a-help">Nothing saved yet. Fill this in and save to create it.</p>}
        <CrudForm
          key={row?.id ?? "new"}
          formId={formId}
          config={config}
          row={row}
          inline
          onSaved={onSaved}
        />
      </section>
    );
  }

  const open = editing !== null;
  const editingRow = editing?.kind === "edit" ? editing.row : null;

  return (
    <section aria-label={config.title}>
      <div className="a-toolbar">
        <div className="a-search">
          <label htmlFor={`${formId}-q`} className="a-sr-only">Search {config.title.toLowerCase()}</label>
          <input id={`${formId}-q`} type="search" className="a-input" placeholder={`Search ${config.title.toLowerCase()}`}
            value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button type="button" className="a-btn a-btn-primary" onClick={startNew}>Add {config.singular.toLowerCase()}</button>
      </div>

      {rows.length === 0 ? (
        <div className="a-empty">
          <p className="a-empty-title">No {config.title.toLowerCase()} yet.</p>
          <p className="a-text">Add your first {config.singular.toLowerCase()}. New entries are visible on the site as soon as you publish.</p>
          <button type="button" className="a-btn a-btn-primary" onClick={startNew}>Add {config.singular.toLowerCase()}</button>
        </div>
      ) : visibleRows.length === 0 ? (
        <p className="a-text">Nothing matches "{query}". Clear the search to see everything.</p>
      ) : (
        <>
          {orderable && !searching ? (
            <p className="a-help">Drag the handle to reorder, or use Move up and Move down in More.</p>
          ) : null}
          <table className="a-table">
            <caption className="a-sr-only">{config.title}</caption>
            <thead>
              <tr>
                {orderable ? <th scope="col" className="a-col-handle"><span className="a-sr-only">Reorder</span></th> : null}
                {columns.map((c) => <th key={c.name} scope="col">{c.label}</th>)}
                {hasVisibility ? <th scope="col" className="a-col-vis">On the site</th> : null}
                <th scope="col" className="a-col-actions"><span className="a-sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, index) => {
                const id = row.id as string;
                const hidden = hasVisibility && row.is_visible !== true;
                return (
                  <tr
                    key={id}
                    data-row-id={id}
                    data-hidden={hidden ? "true" : undefined}
                    data-dragging={reorder.dragId === id ? "true" : undefined}
                    data-over={reorder.dragId && reorder.overId === id && reorder.dragId !== id ? "true" : undefined}
                  >
                    {orderable ? (
                      <td className="a-col-handle">
                        <button type="button" className="a-handle" aria-label={`Drag to reorder ${rowTitle(config, row)}`}
                          disabled={searching} {...reorder.handleProps(id)}>
                          <span aria-hidden="true" className="a-grip" />
                        </button>
                      </td>
                    ) : null}
                    {columns.map((c, ci) => (
                      <td key={c.name} data-label={c.label} data-primary={ci === 0 ? "true" : undefined}>
                        <Cell field={c} row={row} primary={ci === 0} onOpen={() => setEditing({ kind: "edit", row })} />
                      </td>
                    ))}
                    {hasVisibility ? (
                      <td className="a-col-vis" data-label="On the site">
                        <button type="button" role="switch" aria-checked={!hidden} className="a-switch"
                          disabled={busyId === id} onClick={() => void toggleVisible(row)}
                          aria-label={`${hidden ? "Show" : "Hide"} ${rowTitle(config, row)} on the site`}>
                          <span className="a-switch-track" aria-hidden="true"><span className="a-switch-thumb" /></span>
                          <span>{hidden ? "Hidden" : "Shown"}</span>
                        </button>
                      </td>
                    ) : null}
                    <td className="a-col-actions">
                      <div className="a-actions">
                        <button type="button" className="a-btn a-btn-ghost" onClick={() => setEditing({ kind: "edit", row })}>Edit</button>
                        <Menu
                          items={[
                            { label: "Duplicate", onSelect: () => duplicate(row) },
                            ...(orderable && !searching
                              ? [
                                  { label: "Move up", onSelect: () => moveRow(row, -1), disabled: index === 0 },
                                  { label: "Move down", onSelect: () => moveRow(row, 1), disabled: index === visibleRows.length - 1 },
                                ]
                              : []),
                            { label: "Delete", danger: true, onSelect: () => setToDelete(row) },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      <Modal
        open={open}
        onClose={requestClose}
        title={editingRow ? `Edit ${config.singular.toLowerCase()}` : `Add ${config.singular.toLowerCase()}`}
        variant="sheet"
      >
        {editing ? (
          <CrudForm
            key={editingRow?.id ?? `new-${editing.kind === "new" && editing.initial ? "copy" : "blank"}`}
            formId={`${formId}-form`}
            config={config}
            row={editingRow}
            createExtras={editing.kind === "new" ? editing.extras : undefined}
            initialValues={editing.kind === "new" ? editing.initial : undefined}
            onSaved={onSaved}
            onCancel={requestClose}
            onDirtyChange={setDirty}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={confirmClose}
        title="Discard your changes?"
        message="You changed this entry but have not saved it. Closing now loses those changes."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        onCancel={() => setConfirmClose(false)}
        onConfirm={() => {
          setConfirmClose(false);
          setDirty(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete this ${config.singular.toLowerCase()}?`}
        message={`"${toDelete ? rowTitle(config, toDelete) : ""}" will be removed for good. This cannot be undone. To keep it but hide it, choose Cancel and switch it off instead.`}
        confirmLabel={`Delete ${config.singular.toLowerCase()}`}
        cancelLabel="Cancel"
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </section>
  );
}

function Cell({ field, row, primary, onOpen }: { field: FieldDef; row: DbRow; primary: boolean; onOpen: () => void }) {
  if (field.type === "image") {
    const url = row[field.name];
    return typeof url === "string" && url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="a-thumb" src={url} alt="" loading="lazy" />
    ) : (
      <span className="a-muted">No image</span>
    );
  }
  const text = cellText(field, row);
  if (primary) {
    return (
      <button type="button" className="a-celllink" onClick={onOpen}>
        {text || "Untitled"}
      </button>
    );
  }
  if (field.type === "bilingual-text" || field.type === "bilingual-textarea") {
    const ur = String(row[`${field.name}_ur`] ?? "");
    return (
      <span>
        {text}
        {ur ? <span className="a-muted a-ur" lang="ur-Latn">{ur}</span> : null}
      </span>
    );
  }
  return <span className={text ? undefined : "a-muted"}>{text || "Empty"}</span>;
}
