"use client";
// Nested editor for project_media: pick a project, upload screenshots or video, set kind and captions,
// reorder with up/down buttons (works on touch), hide, delete.
import { useCallback, useEffect, useState } from "react";
import { getDb, revalidate, safeFileName } from "./db";
import { btnCls, btnPrimaryCls, dangerCls, Field, inputCls, Panel, StatusLine, useStatus } from "./ui";

interface MediaRow {
  id: string;
  project_id: string;
  url: string;
  kind: "desktop" | "mobile" | "video" | "other";
  caption_en: string | null;
  caption_ur: string | null;
  is_visible: boolean;
  order_index: number;
}
interface ProjectOption {
  id: string;
  title: string;
  slug: string;
}

const KINDS: MediaRow["kind"][] = ["desktop", "mobile", "video", "other"];
const TAGS = ["content:project_media", "content:projects"];

export default function ProjectMediaEditor() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectId, setProjectId] = useState("");
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const { status, ok, err, clear } = useStatus();

  useEffect(() => {
    getDb()
      .from("projects")
      .select("id,title,slug")
      .order("order_index", { ascending: true })
      .then(({ data, error }) => {
        if (error) return err(error.message);
        const list = (data ?? []) as ProjectOption[];
        setProjects(list);
        setProjectId((cur) => cur || list[0]?.id || "");
      });
  }, [err]);

  const load = useCallback(
    async (id: string) => {
      if (!id) return setRows([]);
      const { data, error } = await getDb().from("project_media").select("*").eq("project_id", id).order("order_index", { ascending: true });
      if (error) return err(error.message);
      setRows((data ?? []) as MediaRow[]);
      setDirty(new Set());
    },
    [err],
  );

  useEffect(() => {
    clear();
    void load(projectId);
  }, [projectId, load, clear]);

  const project = projects.find((p) => p.id === projectId);

  const edit = (id: string, patch: Partial<MediaRow>) => {
    setRows((cur) => cur.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setDirty((cur) => new Set(cur).add(id));
  };

  async function insertRow(url: string, kind: MediaRow["kind"]) {
    const next = rows.length ? Math.max(...rows.map((r) => r.order_index)) + 1 : 0;
    const { error } = await getDb().from("project_media").insert({ project_id: projectId, url, kind, order_index: next, is_visible: true });
    if (error) throw new Error(error.message);
  }

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0 || !project) return;
    setBusy(true);
    clear();
    try {
      for (const file of Array.from(files)) {
        const path = `projects/${project.slug}/${Date.now()}-${safeFileName(file.name)}`;
        const up = await getDb().storage.from("media").upload(path, file, { contentType: file.type || undefined, upsert: false });
        if (up.error) throw new Error(up.error.message);
        const url = getDb().storage.from("media").getPublicUrl(path).data.publicUrl;
        await insertRow(url, file.type.startsWith("video") ? "video" : "desktop");
      }
      await revalidate(TAGS);
      await load(projectId);
      ok("Uploaded. Set the kind (desktop or phone) and a caption, then save.");
    } catch (e) {
      err(e instanceof Error ? e.message : "Upload failed. Check the file size and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function addByUrl() {
    const u = newUrl.trim();
    if (!/^https?:\/\//i.test(u)) return err("Enter a full link that starts with https://");
    setBusy(true);
    try {
      await insertRow(u, "desktop");
      setNewUrl("");
      await revalidate(TAGS);
      await load(projectId);
      ok("Added.");
    } catch (e) {
      err(e instanceof Error ? e.message : "Could not add the link.");
    } finally {
      setBusy(false);
    }
  }

  async function save(row: MediaRow) {
    setBusy(true);
    const { error } = await getDb()
      .from("project_media")
      .update({ url: row.url, kind: row.kind, caption_en: row.caption_en || null, caption_ur: row.caption_ur || null, is_visible: row.is_visible })
      .eq("id", row.id);
    setBusy(false);
    if (error) return err(error.message);
    setDirty((cur) => {
      const n = new Set(cur);
      n.delete(row.id);
      return n;
    });
    await revalidate(TAGS);
    ok("Saved.");
  }

  async function remove(row: MediaRow) {
    if (!window.confirm("Delete this media item? The uploaded file stays in storage.")) return;
    setBusy(true);
    const { error } = await getDb().from("project_media").delete().eq("id", row.id);
    setBusy(false);
    if (error) return err(error.message);
    await revalidate(TAGS);
    await load(projectId);
    ok("Deleted.");
  }

  async function move(index: number, dir: -1 | 1) {
    const a = rows[index];
    const b = rows[index + dir];
    if (!a || !b) return;
    setBusy(true);
    const db = getDb();
    const r1 = await db.from("project_media").update({ order_index: b.order_index }).eq("id", a.id);
    const r2 = await db.from("project_media").update({ order_index: a.order_index }).eq("id", b.id);
    setBusy(false);
    if (r1.error || r2.error) return err((r1.error ?? r2.error)?.message ?? "Could not reorder.");
    await revalidate(TAGS);
    await load(projectId);
  }

  return (
    <Panel title="Project media" intro="Screenshots and video shown in the project band and the case-study page. Desktop shots go in the laptop frame, phone shots in the phone frame.">
      <Field label="Project">
        <select className={inputCls} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          {projects.length === 0 && <option value="">No projects yet. Add one above.</option>}
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end">
        <Field label="Upload images or video">
          <input className={inputCls} type="file" multiple accept="image/*,video/mp4,video/webm" disabled={busy || !projectId} onChange={(e) => { void onFiles(e.target.files); e.target.value = ""; }} />
        </Field>
        <Field label="Or paste a link">
          <input className={inputCls} type="url" inputMode="url" placeholder="https://" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
        </Field>
        <button type="button" className={btnCls} disabled={busy || !projectId || !newUrl.trim()} onClick={() => void addByUrl()}>
          Add link
        </button>
      </div>

      <StatusLine status={status} />

      {rows.length === 0 ? (
        <p className="text-sm opacity-75">No media for this project yet.</p>
      ) : (
        <ul className="grid gap-4">
          {rows.map((r, i) => (
            <li key={r.id} className="grid gap-3 rounded-lg border border-current/25 p-4 md:grid-cols-[120px_1fr]">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-current/10 md:w-[120px]">
                {r.kind === "video" ? (
                  <video src={r.url} className="h-full w-full object-cover" muted preload="metadata" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Kind">
                    <select className={inputCls} value={r.kind} onChange={(e) => edit(r.id, { kind: e.target.value as MediaRow["kind"] })}>
                      {KINDS.map((k) => (
                        <option key={k} value={k}>
                          {k === "mobile" ? "mobile (phone frame)" : k === "desktop" ? "desktop (laptop frame)" : k}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Link">
                    <input className={inputCls} type="url" value={r.url} onChange={(e) => edit(r.id, { url: e.target.value })} />
                  </Field>
                  <Field label="Caption (English)">
                    <input className={inputCls} value={r.caption_en ?? ""} onChange={(e) => edit(r.id, { caption_en: e.target.value })} />
                  </Field>
                  <Field label="Caption (Roman Urdu)">
                    <input className={inputCls} value={r.caption_ur ?? ""} onChange={(e) => edit(r.id, { caption_ur: e.target.value })} />
                  </Field>
                </div>
                <label className="flex min-h-11 items-center gap-3 text-sm">
                  <input type="checkbox" className="h-5 w-5" checked={r.is_visible} onChange={(e) => edit(r.id, { is_visible: e.target.checked })} />
                  Show on the public site
                </label>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={btnPrimaryCls} disabled={busy || !dirty.has(r.id)} onClick={() => void save(r)}>
                    {dirty.has(r.id) ? "Save changes" : "Saved"}
                  </button>
                  <button type="button" className={btnCls} disabled={busy || i === 0} onClick={() => void move(i, -1)} aria-label="Move up">
                    Move up
                  </button>
                  <button type="button" className={btnCls} disabled={busy || i === rows.length - 1} onClick={() => void move(i, 1)} aria-label="Move down">
                    Move down
                  </button>
                  <button type="button" className={dangerCls} disabled={busy} onClick={() => void remove(r)}>
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
