"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/guard";
import { getRequestDb } from "@/lib/api/db";

const STATUSES = ["new", "contacted", "won", "lost", "spam"] as const;

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(STATUSES),
  notes: z.string().max(4000),
});

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateInquiry(input: { id: string; status: string; notes: string }): Promise<ActionResult> {
  await requireAdmin();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Status or notes are not valid. Notes can be up to 4000 characters." };

  const db = await getRequestDb();
  const { error } = await db
    .from("inquiries")
    .update({ status: parsed.data.status, notes: parsed.data.notes.trim() || null })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, error: "Could not save. Check you are still logged in, then try again." };

  revalidatePath("/abdullah/admin/inquiries");
  return { ok: true };
}

export async function deleteInquiry(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: "Unknown inquiry." };
  const db = await getRequestDb();
  const { error } = await db.from("inquiries").delete().eq("id", id);
  if (error) return { ok: false, error: "Could not delete. Try again." };
  revalidatePath("/abdullah/admin/inquiries");
  return { ok: true };
}
