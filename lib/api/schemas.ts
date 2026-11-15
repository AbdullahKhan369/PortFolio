import { z } from "zod";

/** Server-side validation for the public APIs (contract section 8). */

const clean = (max: number) =>
  z
    .string()
    .transform((s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim())
    .pipe(z.string().max(max));

export const inquirySchema = z.object({
  name: clean(80).optional().nullable(),
  contact: clean(120).pipe(
    z.string().min(5, "Add a phone number, email or WhatsApp number so I can reply.")
  ),
  message: clean(2000).pipe(z.string().min(5, "Write at least a short line about what you need.")),
  niche: clean(40).optional().nullable(),
  source: z.enum(["form", "configurator", "sparks"]),
  lang: z.enum(["en", "ur"]),
  /** Honeypot. Real visitors never see this field. */
  website: z.string().max(500).optional().nullable(),
});
export type InquiryInput = z.infer<typeof inquirySchema>;

const metaValue = z.union([z.string().max(200), z.number(), z.boolean(), z.null()]);

export const eventSchema = z.object({
  name: z
    .string()
    .trim()
    .regex(/^[a-z0-9_]{2,40}$/, "Event names use lowercase letters, numbers and underscores."),
  path: z
    .string()
    .trim()
    .max(200)
    .regex(/^\/[^\s]*$/, "Path must start with /.")
    .optional()
    .nullable(),
  meta: z.record(z.string().max(40), metaValue).optional().nullable(),
});
export type EventInput = z.infer<typeof eventSchema>;

/** Keeps event meta small: max 10 keys. */
export function trimMeta(meta: EventInput["meta"]): Record<string, string | number | boolean | null> | null {
  if (!meta) return null;
  const out: Record<string, string | number | boolean | null> = {};
  for (const key of Object.keys(meta).slice(0, 10)) out[key] = meta[key] as string | number | boolean | null;
  return Object.keys(out).length ? out : null;
}
