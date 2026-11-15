import { getServiceDb } from "./db";

/**
 * Database-backed backstop for /api/inquiries. The in-memory limiter resets on every cold start,
 * so this counts real rows. Read-only, uses the service role on the server.
 * Returns true when the submission should be refused with 429.
 */
export async function isFlooded(contact: string): Promise<boolean> {
  try {
    const db = await getServiceDb();
    const tenMinutesAgo = new Date(Date.now() - 10 * 60_000).toISOString();
    const hourAgo = new Date(Date.now() - 60 * 60_000).toISOString();

    const sameContact = await db
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("contact", contact)
      .gte("created_at", tenMinutesAgo);
    if ((sameContact.count ?? 0) >= 3) return true;

    const overall = await db
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .gte("created_at", hourAgo);
    return (overall.count ?? 0) >= 100;
  } catch {
    // If the check itself fails we do not block a real person; the insert is still guarded by RLS.
    return false;
  }
}
