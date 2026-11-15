"use client";

import { useRef, useState } from "react";
import { btnGhost, btnPrimary, label, muted, panel } from "../_s4/styles";
import type { ImportSummaryRow } from "./tables";

type Result = { ok: boolean; error?: string; summary?: ImportSummaryRow[] };

export default function BackupPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [withInquiries, setWithInquiries] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function onImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setResult({ ok: false, error: "Choose a backup file first." });
      return;
    }
    if (!window.confirm(`Import "${file.name}"? Rows with the same id are overwritten. Nothing is deleted.`)) return;

    setBusy(true);
    setResult(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/abdullah/admin/backup/import", { method: "POST", body });
      const type = res.headers.get("content-type") || "";
      if (!type.includes("application/json")) {
        setResult({ ok: false, error: "Your session may have expired. Log in again, then retry the import." });
      } else {
        setResult((await res.json()) as Result);
      }
    } catch {
      setResult({ ok: false, error: "No connection. Check your internet and try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className={panel} aria-labelledby="bk-export">
        <h2 id="bk-export" className="font-display text-[1.25rem] font-semibold">
          Download backup
        </h2>
        <p className={`${muted} mt-2`}>
          One JSON file with all your content: profile, achievements, projects, campaigns, systems, services, process chat, studio text and settings. Images stay in Supabase Storage and are not inside the file.
        </p>
        <label className="mt-4 flex min-h-[44px] items-center gap-3 font-body text-[15px]">
          <input type="checkbox" checked={withInquiries} onChange={(e) => setWithInquiries(e.target.checked)} className="h-5 w-5" />
          Include the inquiries inbox (contains visitors&apos; contact details)
        </label>
        <a href={`/abdullah/admin/backup/export${withInquiries ? "?inquiries=1" : ""}`} className={`${btnPrimary} mt-4`}>
          Download backup
        </a>
      </section>

      <section className={panel} aria-labelledby="bk-import">
        <h2 id="bk-import" className="font-display text-[1.25rem] font-semibold">
          Restore from backup
        </h2>
        <p className={`${muted} mt-2`}>
          Merges a backup file into the live content. Rows with the same id are overwritten, new rows are added, nothing is deleted. Inquiries are never imported.
        </p>
        <form onSubmit={onImport} className="mt-4">
          <label htmlFor="bk-file" className={label}>
            Backup file (.json)
          </label>
          <input
            ref={fileRef}
            id="bk-file"
            type="file"
            accept="application/json,.json"
            className="mt-2 block w-full font-body text-[15px] file:mr-3 file:min-h-[44px] file:rounded-full file:border file:border-text/30 file:bg-transparent file:px-4 file:font-display file:text-text"
          />
          <button type="submit" disabled={busy} className={`${btnGhost} mt-4`}>
            {busy ? "Importing" : "Import backup"}
          </button>
        </form>

        <div role="status" aria-live="polite" className="mt-4 empty:hidden">
          {result ? (
            <>
              <p className={result.ok ? "font-display text-[15px] font-medium" : "font-body text-[15px] text-amber"}>
                {result.ok ? "Import finished. The public site is refreshed." : result.error}
              </p>
              {result.summary ? (
                <ul className="m-0 mt-3 flex list-none flex-col p-0">
                  {result.summary.map((s) => (
                    <li key={s.table} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-text/10 py-2 last:border-0">
                      <span className="font-display text-[14px]">{s.table}</span>
                      <span className={`${muted} ${s.status === "failed" ? "!text-amber" : ""}`}>
                        {s.status}
                        {s.status !== "skipped" ? `, ${s.rows} rows` : ""}
                        {s.note ? `, ${s.note}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
