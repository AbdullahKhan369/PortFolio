"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { MEDIA_BUCKET } from "@/lib/media";
import { ConfirmDialog } from "../kit/ConfirmDialog";
import { explain } from "../kit/CrudForm";
import { MEDIA_ACCEPT, cleanFolder, deleteFromMedia, formatBytes, uploadToMedia } from "../kit/storage";
import { useToast } from "../kit/Toast";

interface Entry { name: string; isFolder: boolean; size?: number; mime?: string }
const PAGE = 60;

export function MediaLibrary() {
  const toast = useToast();
  const supabase = useMemo(() => createClient(), []);
  const [folder, setFolder] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newFolder, setNewFolder] = useState("");
  const [del, setDel] = useState<Entry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const publicUrl = useCallback(
    (name: string) => supabase.storage.from(MEDIA_BUCKET).getPublicUrl(folder ? `${folder}/${name}` : name).data.publicUrl,
    [supabase, folder],
  );

  const load = useCallback(async (offset: number) => {
    setLoading(true); setError(null);
    const { data, error: e } = await supabase.storage.from(MEDIA_BUCKET).list(folder, {
      limit: PAGE, offset, sortBy: { column: "created_at", order: "desc" },
    });
    if (e) { setError(explain(e)); setLoading(false); return; }
    const items: Entry[] = (data ?? [])
      .filter((o) => o.name !== ".emptyFolderPlaceholder")
      .map((o) => ({ name: o.name, isFolder: o.id === null, size: o.metadata?.size as number | undefined, mime: o.metadata?.mimetype as string | undefined }));
    setEntries((prev) => (offset === 0 ? items : [...prev, ...items]));
    setMore((data ?? []).length === PAGE);
    setLoading(false);
  }, [supabase, folder]);

  useEffect(() => { void load(0); }, [load]);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    let ok = 0;
    for (const file of Array.from(files)) {
      try { await uploadToMedia(file, folder || "library", MEDIA_ACCEPT); ok++; }
      catch (e) { toast.error(`${file.name}: ${e instanceof Error ? e.message : "upload failed"}`); }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (ok) { toast.success(ok === 1 ? "Uploaded." : `Uploaded ${ok} files.`); await load(0); }
  }

  async function copy(name: string) {
    try { await navigator.clipboard.writeText(publicUrl(name)); toast.success("Link copied."); }
    catch { toast.error("Could not copy. Open the file and copy the link from the address bar."); }
  }

  async function confirmDelete() {
    if (!del) return;
    setDeleting(true);
    try {
      await deleteFromMedia([folder ? `${folder}/${del.name}` : del.name]);
      setEntries((l) => l.filter((x) => x.name !== del.name));
      toast.success("Deleted.");
      setDel(null);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not delete."); }
    setDeleting(false);
  }

  const crumbs = folder ? folder.split("/") : [];

  return (
    <section aria-label="Media library">
      <div className="a-toolbar">
        <nav aria-label="Folder" className="a-crumbs">
          <button type="button" className="a-btn a-btn-quiet" onClick={() => setFolder("")} aria-current={folder === "" ? "page" : undefined}>All files</button>
          {crumbs.map((c, i) => (
            <button key={i} type="button" className="a-btn a-btn-quiet" onClick={() => setFolder(crumbs.slice(0, i + 1).join("/"))}>/ {c}</button>
          ))}
        </nav>
        <div className="a-actions">
          <input ref={fileRef} type="file" accept={MEDIA_ACCEPT} multiple className="a-sr-only" id="media-files" onChange={(e) => void onFiles(e.target.files)} />
          <button type="button" className="a-btn a-btn-primary" disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? "Uploading..." : `Upload to ${folder || "library"}`}
          </button>
        </div>
      </div>

      <form className="a-tag-add" onSubmit={(e) => { e.preventDefault(); const c = cleanFolder(newFolder); setFolder(folder ? `${folder}/${c}` : c); setNewFolder(""); }}>
        <label className="a-sr-only" htmlFor="new-folder">New folder name</label>
        <input id="new-folder" className="a-input" placeholder="New folder name" value={newFolder} onChange={(e) => setNewFolder(e.target.value)} />
        <button type="submit" className="a-btn a-btn-ghost" disabled={!newFolder.trim()}>Open folder</button>
      </form>
      <p className="a-help" style={{ marginTop: 8 }}>A folder appears once you upload a file into it. Images are shrunk to 2400 px on the long side before upload. Max 10 MB per file (images, short videos and PDFs).</p>

      {error ? <p className="a-banner a-banner-error" role="alert">{error}</p> : null}
      {loading && entries.length === 0 ? <p className="a-text" role="status">Loading files...</p> : null}
      {!loading && !error && entries.length === 0 ? (
        <div className="a-empty">
          <p className="a-empty-title">This folder is empty.</p>
          <p className="a-text">Upload photos, certificate scans, screenshots or videos. You can paste a file link into any image or link field.</p>
        </div>
      ) : null}

      <ul className="a-media-grid">
        {entries.map((e) => {
          const isImg = !e.isFolder && (e.mime?.startsWith("image/") ?? /\.(png|jpe?g|webp|avif)$/i.test(e.name));
          return (
            <li key={e.name} className="a-media-item">
              {e.isFolder ? (
                <button type="button" className="a-folder" onClick={() => setFolder(folder ? `${folder}/${e.name}` : e.name)}>Folder: {e.name}</button>
              ) : (
                <>
                  <div className="a-media-thumb">
                    {isImg ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={publicUrl(e.name)} alt="" loading="lazy" /> : <span>{(e.mime ?? "file").split("/")[1]}</span>}
                  </div>
                  <p className="a-media-name">{e.name}{e.size ? <span className="a-muted"> ({formatBytes(e.size)})</span> : null}</p>
                  <div className="a-actions">
                    <button type="button" className="a-btn a-btn-ghost" onClick={() => void copy(e.name)}>Copy link</button>
                    <a className="a-btn a-btn-quiet" href={publicUrl(e.name)} target="_blank" rel="noopener noreferrer">Open<span className="a-sr-only"> {e.name} (opens in a new tab)</span></a>
                    <button type="button" className="a-btn a-btn-quiet" onClick={() => setDel(e)}>Delete</button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
      {more ? <div style={{ marginTop: 16 }}><button type="button" className="a-btn a-btn-ghost" disabled={loading} onClick={() => void load(entries.length)}>Load more</button></div> : null}

      <ConfirmDialog open={del !== null} title="Delete this file?"
        message={`"${del?.name ?? ""}" will be removed for good. Any page still using its link will show a broken image.`}
        confirmLabel="Delete file" cancelLabel="Cancel" busy={deleting} onCancel={() => setDel(null)} onConfirm={() => void confirmDelete()} />
    </section>
  );
}
