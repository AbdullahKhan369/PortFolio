import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { ADMIN_LOGIN } from "@/lib/admin/session";
import { createClient } from "./server";

export interface AdminContext {
  user: User;
  supabase: SupabaseClient;
}

/**
 * Returns the admin context, or null when the visitor is not a fully signed-in admin.
 * "Fully" means: valid session, listed in public.admins, and (if they enrolled TOTP) AAL2.
 */
export async function getAdmin(): Promise<AdminContext | null> {
  const supabase = await createClient();
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) return null;

  const { data: row } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (!row) return null;

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") return null;

  return { user: userData.user, supabase };
}

/** For admin Server Components and pages: redirects to the login page when not an admin. */
export async function requireAdmin(): Promise<AdminContext> {
  const admin = await getAdmin();
  if (!admin) redirect(ADMIN_LOGIN);
  return admin;
}
