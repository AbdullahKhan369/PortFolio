// middleware.ts (Session 1): admin guard + locale redirect.
//
// SECURITY MODEL: the hidden URL /abdullah/admin is only a curtain. The locks are:
//   1. this guard (valid Supabase session + listed in public.admins + AAL2 if TOTP is enrolled + idle timeout),
//   2. server-side requireAdmin() in every admin page,
//   3. Row Level Security in Postgres (the real lock: even a forged request cannot write without is_admin()).
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  ADMIN_BASE, ADMIN_IDLE_MS, ADMIN_LOGIN, ADMIN_SEEN_COOKIE, safeNext,
} from "@/lib/admin/session";
import { DEFAULT_LANG, LANGS, LANG_COOKIE, isLang } from "@/lib/i18n/config";
import { getSupabaseEnv } from "@/lib/supabase/env";

const ROBOTS = "noindex, nofollow, noarchive, nosnippet";

function hardenAdmin(res: NextResponse): NextResponse {
  res.headers.set("X-Robots-Tag", ROBOTS);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

function redirectToLogin(req: NextRequest, extra?: Record<string, string>): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = ADMIN_LOGIN;
  url.search = "";
  const next = safeNext(req.nextUrl.pathname + req.nextUrl.search);
  if (next !== ADMIN_BASE) url.searchParams.set("next", next);
  for (const [k, v] of Object.entries(extra ?? {})) url.searchParams.set(k, v);
  return hardenAdmin(NextResponse.redirect(url));
}

async function guardAdmin(req: NextRequest): Promise<NextResponse> {
  const env = getSupabaseEnv();
  const isLogin = req.nextUrl.pathname === ADMIN_LOGIN || req.nextUrl.pathname === `${ADMIN_LOGIN}/`;

  // Not configured yet: the login page explains it; everything else goes there.
  if (!env) return isLogin ? hardenAdmin(NextResponse.next()) : redirectToLogin(req);

  let response = NextResponse.next({ request: req });
  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        response = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const copyCookies = (to: NextResponse) => {
    response.cookies.getAll().forEach((c) => to.cookies.set(c));
    return to;
  };

  // getUser() validates the token with Supabase (getSession() alone can be spoofed).
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return isLogin ? hardenAdmin(response) : copyCookies(redirectToLogin(req));
  }

  // Idle timeout.
  const seen = Number(req.cookies.get(ADMIN_SEEN_COOKIE)?.value);
  if (Number.isFinite(seen) && seen > 0 && Date.now() - seen > ADMIN_IDLE_MS) {
    await supabase.auth.signOut();
    const out = redirectToLogin(req, { reason: "timeout" });
    out.cookies.delete(ADMIN_SEEN_COOKIE);
    return copyCookies(out);
  }

  // Must be in the allow-list. (RLS lets a user read only their own row in public.admins.)
  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!adminRow) {
    await supabase.auth.signOut();
    const out = redirectToLogin(req);
    out.cookies.delete(ADMIN_SEEN_COOKIE);
    return copyCookies(out);
  }

  // If the admin enrolled TOTP, the session must be AAL2.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const needsCode = !!aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2";

  if (isLogin) {
    // Signed in and verified: skip the login page. Waiting for the code: stay on it.
    if (!needsCode) {
      const to = req.nextUrl.clone();
      to.pathname = safeNext(req.nextUrl.searchParams.get("next"));
      to.search = "";
      return copyCookies(hardenAdmin(NextResponse.redirect(to)));
    }
    return hardenAdmin(response);
  }
  if (needsCode) return copyCookies(redirectToLogin(req));

  response.cookies.set(ADMIN_SEEN_COOKIE, String(Date.now()), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: ADMIN_BASE,
  });
  return hardenAdmin(response);
}

function localeRedirect(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if ((LANGS as readonly string[]).includes(first)) return null; // already /en or /ur

  // Anything under /abdullah that is not the admin area is left alone (it will 404).
  if (first === "abdullah") return null;

  const cookieLang = req.cookies.get(LANG_COOKIE)?.value;
  const lang = isLang(cookieLang) ? cookieLang : DEFAULT_LANG;
  const url = req.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === ADMIN_BASE || pathname.startsWith(`${ADMIN_BASE}/`)) {
    return guardAdmin(req);
  }
  return localeRedirect(req) ?? NextResponse.next();
}

export const config = {
  // Skip Next internals, API routes (they check auth themselves) and any file with an extension
  // (favicon.ico, robots.txt, sitemap.xml, images...).
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
