"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/guard";
import { getRequestDb } from "@/lib/api/db";

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);

const schema = z.object({
  seo_title_en: text(120),
  seo_title_ur: text(120),
  seo_description_en: text(320),
  seo_description_ur: text(320),
  brand_handle: text(60),
  site_url: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === "" || /^https?:\/\/[^\s/]+\.[^\s/]+/i.test(v), "Use a full address such as https://example.com."),
});

export interface SeoState {
  ok: boolean;
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof schema>, string>>;
}

/** Saves the SEO-related keys of site_settings, then refreshes the public pages that use them. */
export async function saveSeo(_prev: SeoState, formData: FormData): Promise<SeoState> {
  await requireAdmin();

  const raw = Object.fromEntries(
    Object.keys(schema.shape).map((k) => [k, String(formData.get(k) ?? "")])
  );
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: NonNullable<SeoState["errors"]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof z.infer<typeof schema>;
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, message: "Fix the fields marked below, then save again.", errors };
  }

  const rows = Object.entries(parsed.data).map(([key, value]) => ({ key, value }));
  const db = await getRequestDb();
  const { error } = await db.from("site_settings").upsert(rows, { onConflict: "key" });
  if (error) return { ok: false, message: "Could not save. Check you are still logged in, then try again." };

  revalidateTag("content:site_settings");
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved and published." };
}
