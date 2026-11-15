"use client";

import { useState, useTransition } from "react";
import { buildWaLink } from "@/lib/whatsapp";
import { btnDanger, btnGhost, btnPrimary, input, label, muted, panel } from "../_s4/styles";
import { deleteInquiry, updateInquiry } from "./actions";

export interface CardInquiry {
  id: string;
  name: string | null;
  contact: string;
  message: string;
  niche: string | null;
  source: string;
  status: string;
  notes: string | null;
  lang: string | null;
  created_at: string;
  phone: string | null;
}

const STATUSES = ["new", "contacted", "won", "lost", "spam"];

/** One inquiry. Cards on every width: they collapse naturally on a phone, no horizontal table scroll. */
export default function InquiryCard({ item }: { item: CardInquiry }) {
  const [status, setStatus] = useState(item.status);
  const [notes, setNotes] = useState(item.notes ?? "");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [gone, setGone] = useState(false);
  const [pending, start] = useTransition();

  if (gone) return null;
  const dirty = status !== item.status || notes !== (item.notes ?? "");
  const date = new Date(item.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

  function save() {
    start(async () => {
      const res = await updateInquiry({ id: item.id, status, notes });
      setMessage(res.ok ? { kind: "ok", text: "Saved" } : { kind: "error", text: res.error });
    });
  }

  function remove() {
    if (!window.confirm("Delete this inquiry? This cannot be undone.")) return;
    start(async () => {
      const res = await deleteInquiry(item.id);
      if (res.ok) setGone(true);
      else setMessage({ kind: "error", text: res.error });
    });
  }

  return (
    <li className={`${panel} list-none`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="break-words font-display text-[17px] font-semibold">{item.name || "No name given"}</p>
          <p className="break-all font-body text-[15px]">{item.contact}</p>
        </div>
        <p className={muted}>
          {date}
          <br />
          {item.source}
          {item.lang ? `, ${item.lang === "ur" ? "Roman Urdu" : "English"}` : ""}
          {item.niche ? `, ${item.niche}` : ""}
        </p>
      </div>

      <p className="mt-4 whitespace-pre-wrap break-words font-body text-[16px] leading-[1.65]">{item.message}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-[200px_1fr]">
        <div>
          <label htmlFor={`st-${item.id}`} className={label}>
            Status
          </label>
          <select id={`st-${item.id}`} value={status} onChange={(e) => setStatus(e.target.value)} className={input}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`nt-${item.id}`} className={label}>
            Notes (only you see these)
          </label>
          <textarea
            id={`nt-${item.id}`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            maxLength={4000}
            className={input}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button type="button" onClick={save} disabled={pending || !dirty} className={btnPrimary}>
          {pending ? "Saving" : "Save changes"}
        </button>
        {item.phone ? (
          <a href={buildWaLink({ number: item.phone })} target="_blank" rel="noopener noreferrer" className={btnGhost}>
            Reply on WhatsApp<span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : item.contact.includes("@") ? (
          <a href={`mailto:${item.contact}`} className={btnGhost}>
            Reply by email
          </a>
        ) : null}
        <button type="button" onClick={remove} disabled={pending} className={btnDanger}>
          Delete
        </button>
        <span role="status" aria-live="polite" className={`${muted} ${message?.kind === "error" ? "!text-amber" : ""}`}>
          {message?.text}
        </span>
      </div>
    </li>
  );
}
