/**
 * Client helpers for the public APIs. Plain fetch, no dependencies.
 * Importable from any client component (S3 may use postInquiry too, contract section 8).
 */
import type { Lang } from "@/lib/content/types";

export interface InquiryPayload {
  name?: string;
  contact: string;
  message: string;
  niche?: string;
  source: "form" | "configurator" | "sparks";
  lang: Lang;
  website?: string;
}

export type InquiryResult = { ok: true } | { ok: false; error: string; status: number };

export async function postInquiry(payload: InquiryPayload): Promise<InquiryResult> {
  try {
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (res.ok && json?.ok) return { ok: true };
    return { ok: false, status: res.status, error: json?.error || "Something went wrong. Try again." };
  } catch {
    return { ok: false, status: 0, error: "No connection. Check your internet and send again." };
  }
}

/** Fire-and-forget analytics event. Never throws, never blocks the UI. */
export function track(name: string, meta?: Record<string, string | number | boolean | null>) {
  try {
    const body = JSON.stringify({ name, path: window.location.pathname, meta });
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* tracking must never break the page */
  }
}
