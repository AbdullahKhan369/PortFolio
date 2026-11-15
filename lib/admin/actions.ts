"use server";

// Server actions for the admin: sign in (with rate limiting and generic errors) and sign out.
// CRUD does not go through here: it runs in the browser as the signed-in admin and Postgres RLS is the lock.
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ADMIN_BASE, ADMIN_LOGIN, ADMIN_SEEN_COOKIE, safeNext } from "@/lib/admin/session";
import { createClient } from "@/lib/supabase/server";

export type SignInState = {
  status: "idle" | "error" | "mfa";
  message?: string;
  next?: string;
};

const GENERIC_ERROR = "Email or password is not correct. Check both and try again.";
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

// Best-effort limiter: memory lives per server instance. Supabase Auth also rate-limits sign-ins
// (Authentication > Rate Limits), so keep that enabled. See README-SETUP.md.
const failures = new Map<string, { count: number; first: number }>();

function limiterKey(ip: string, email: string) {
  return `${ip}|${email.toLowerCase()}`;
}

function isBlocked(key: string): boolean {
  const entry = failures.get(key);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    failures.delete(key);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

function recordFailure(key: string) {
  const now = Date.now();
  const entry = failures.get(key);
  if (!entry || now - entry.first > WINDOW_MS) failures.set(key, { count: 1, first: now });
  else entry.count += 1;
  if (failures.size > 500) {
    for (const [k, v] of failures) if (now - v.first > WINDOW_MS) failures.delete(k);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const schema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
  next: z.string().max(300).optional(),
});

export async function signInAction(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) return { status: "error", message: GENERIC_ERROR };
  const { email, password } = parsed.data;
  const next = safeNext(parsed.data.next);

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const key = limiterKey(ip, email);
  if (isBlocked(key)) {
    await sleep(400);
    return { status: "error", message: "Too many attempts. Wait 15 minutes, then try again." };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return {
      status: "error",
      message: "The site is not connected to Supabase yet. Add the keys from .env.example and redeploy.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    recordFailure(key);
    await sleep(600); // slows guessing; the message stays the same for every failure
    return { status: "error", message: GENERIC_ERROR };
  }

  // Signed in is not enough: the account must be in public.admins.
  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (!adminRow) {
    await supabase.auth.signOut();
    recordFailure(key);
    await sleep(600);
    return { status: "error", message: GENERIC_ERROR };
  }

  failures.delete(key);

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
    return { status: "mfa", next };
  }

  const jar = await cookies();
  jar.set(ADMIN_SEEN_COOKIE, String(Date.now()), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: ADMIN_BASE,
  });
  redirect(next);
}

export async function signOutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Not configured: nothing to sign out of.
  }
  const jar = await cookies();
  jar.delete({ name: ADMIN_SEEN_COOKIE, path: ADMIN_BASE });
  redirect(ADMIN_LOGIN);
}
