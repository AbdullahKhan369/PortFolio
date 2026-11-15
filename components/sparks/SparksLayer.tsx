import type { Lang } from "@/lib/content/types";
import { getSiteSettings } from "@/lib/content";
import { getMessages } from "@/lib/i18n";
import SparksClient from "./SparksClient";

const NEW_TAB = { en: "opens in a new tab", ur: "naye tab mein khulta hai" } as const;

interface Props {
  lang: Lang;
  /** Optional overrides. When the layout passes nothing, settings are read here. */
  enabled?: boolean;
  offerText?: string;
  whatsappNumber?: string;
}

/**
 * SparksLayer({ lang }) from the contract, as a thin server wrapper so the layout only has to
 * pass `lang`. It reads `sparks_enabled`, `audit_offer_enabled`, the offer text and the WhatsApp
 * number from settings, and renders nothing when the hunt is off or there is no number to open.
 */
export default async function SparksLayer({ lang, enabled, offerText, whatsappNumber }: Props) {
  const [settings, msgs] = await Promise.all([getSiteSettings(), getMessages(lang, ["sparks"])]);
  const t = msgs.sparks ?? {};

  const on = enabled ?? (settings.sparks_enabled !== false && settings.audit_offer_enabled !== false);
  const number = (whatsappNumber ?? settings.whatsapp_number ?? "").trim();
  if (!on || !number) return null;

  const text =
    offerText?.trim() ||
    (lang === "ur" ? settings.audit_offer_text_ur : settings.audit_offer_text_en)?.trim() ||
    t.offer_default ||
    "";

  return <SparksClient lang={lang} number={number} offerText={text} t={t} newTab={NEW_TAB[lang]} />;
}
