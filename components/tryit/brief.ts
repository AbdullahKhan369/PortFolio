// Builds the WhatsApp brief and the inquiry payload for "Try your business". Pure functions, no React.
import { fill } from "@/components/work/utils";
import type { Lang } from "@/lib/content/types";

export type BlockKey = "catalogue" | "story" | "gallery" | "hours";
export const BLOCKS: BlockKey[] = ["catalogue", "gallery", "story", "hours"];

export const LIMITS = { name: 80, contact: 120, message: 1000 } as const;

export function buildBrief(opts: { m: Record<string, string>; nicheLabel: string; name: string; blocks: BlockKey[] }): string {
  const { m, nicheLabel, name, blocks } = opts;
  const cleanName = name.trim();
  const intro = fill(m.msg_intro, { niche: nicheLabel, name: cleanName ? fill(m.msg_name, { name: cleanName }) : "" });
  const ordered = BLOCKS.filter((b) => blocks.includes(b)).map((b) => m[`block_${b}`]);
  const parts = [intro];
  if (ordered.length > 0) parts.push(fill(m.msg_sections, { sections: ordered.join(", ") }));
  parts.push(m.msg_close);
  return parts.filter(Boolean).join(" ");
}

export interface InquiryPayload {
  name?: string;
  contact: string;
  message: string;
  niche: string;
  source: "configurator";
  lang: Lang;
  website: string;
}

/** Matches POST /api/inquiries in contract section 8. `website` is the honeypot and must stay empty for humans. */
export function buildInquiry(opts: {
  lang: Lang;
  nicheKey: string;
  name: string;
  contact: string;
  fallbackContact: string;
  message: string;
  honeypot: string;
}): InquiryPayload {
  const name = opts.name.trim().slice(0, LIMITS.name);
  const contact = (opts.contact.trim() || opts.fallbackContact).slice(0, LIMITS.contact);
  return {
    ...(name ? { name } : {}),
    contact,
    message: opts.message.slice(0, LIMITS.message),
    niche: opts.nicheKey,
    source: "configurator",
    lang: opts.lang,
    website: opts.honeypot,
  };
}
