// Shared, edge-safe constants for the admin guard (middleware, server actions, guard.ts).

export const ADMIN_BASE = "/abdullah/admin";
export const ADMIN_LOGIN = `${ADMIN_BASE}/login`;

/** Signed out after this long without a request. */
export const ADMIN_IDLE_MS = 60 * 60 * 1000;
/** httpOnly cookie that stores the time of the last admin request (epoch ms). */
export const ADMIN_SEEN_COOKIE = "pa_admin_seen";

/** Only allow redirecting back into the admin area (blocks open redirects such as //evil.com). */
export function safeNext(value: string | null | undefined): string {
  if (!value) return ADMIN_BASE;
  if (!value.startsWith(ADMIN_BASE)) return ADMIN_BASE;
  if (value.startsWith("//") || value.includes("\\") || value.includes("://")) return ADMIN_BASE;
  if (value.startsWith(ADMIN_LOGIN)) return ADMIN_BASE;
  return value;
}
