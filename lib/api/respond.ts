import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHash } from "node:crypto";

export type ApiOk = { ok: true };
export type ApiFail = { ok: false; error: string };

const NO_STORE = { "Cache-Control": "no-store" };

export function ok(): NextResponse<ApiOk> {
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}

export function fail(status: 400 | 403 | 413 | 429 | 500, error: string, headers?: Record<string, string>) {
  return NextResponse.json<ApiFail>({ ok: false, error }, { status, headers: { ...NO_STORE, ...headers } });
}

/** Client key for rate limiting. Hashed, never stored in the database. */
export function clientKey(req: NextRequest, scope: string): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = fwd || req.headers.get("x-real-ip") || "unknown";
  const ua = (req.headers.get("user-agent") || "").slice(0, 60);
  return `${scope}:${createHash("sha256").update(`${ip}|${ua}`).digest("hex").slice(0, 24)}`;
}

/**
 * Cross-site posts are refused. Same-origin requests (and tools that send no Origin) pass.
 * Compares the Origin host with the Host header.
 */
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    return !!host && new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Reads a JSON body with a hard size cap. Returns null when invalid or too large. */
export async function readJson(req: NextRequest, maxBytes: number): Promise<unknown | null | "too-large"> {
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > maxBytes) return "too-large";
  const text = await req.text();
  if (text.length > maxBytes) return "too-large";
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
