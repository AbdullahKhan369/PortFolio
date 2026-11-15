"use client";

import { useId, useState } from "react";
import type { Lang } from "@/lib/content/types";
import { Sheet } from "@/components/ui";
import { buildWaLink } from "@/lib/whatsapp";
import { fmt } from "@/lib/api/format";
import { postInquiry, track } from "@/lib/api/track";
import type { OfferMode } from "./useSparkState";

interface Props {
  open: boolean;
  mode: OfferMode;
  lang: Lang;
  number: string;
  offerText: string;
  t: Record<string, string>;
  newTab: string;
  onClose: () => void;
}

/** The reward (or the skip path): a free website audit that opens a prefilled WhatsApp message. */
export default function AuditSheet({ open, mode, lang, number, offerText, t, newTab, onClose }: Props) {
  const id = useId();
  const [site, setSite] = useState("");

  const base = mode === "found" ? t.offer_message_found : t.offer_message_skipped;
  const cleanSite = site.trim();
  const message = cleanSite ? `${base}\n${fmt(t.offer_site_line, { site: cleanSite })}` : base;
  const href = buildWaLink({ number, message });

  function onOpenWhatsApp() {
    track("cta_click", { where: "audit_offer", mode });
    // Keep a record of the request when the visitor gave a link or name. Fire and forget.
    if (cleanSite.length >= 5) {
      void postInquiry({ contact: cleanSite, message: base, source: "sparks", lang });
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={t.sheet_title}>
      <p className="max-w-[34rem] font-body text-[17px] leading-[1.7] text-text">{offerText}</p>

      <div className="mt-6">
        <label htmlFor={`${id}-site`} className="font-display text-[15px] font-medium text-text">
          {t.offer_field_label}
        </label>
        <input
          id={`${id}-site`}
          type="text"
          inputMode="url"
          autoComplete="url"
          maxLength={120}
          value={site}
          onChange={(e) => setSite(e.target.value)}
          aria-describedby={`${id}-help`}
          className="mt-2 w-full rounded-none border border-text/25 bg-base px-4 py-3 font-body text-[16px] text-text focus-visible:border-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure"
        />
        <p id={`${id}-help`} className="mt-2 font-body text-[14px] leading-relaxed text-muted">
          {t.offer_field_help}
        </p>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onOpenWhatsApp}
          className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-wa px-7 font-display text-[16px] font-semibold text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
        >
          {t.offer_cta}
          <span className="sr-only"> ({newTab})</span>
        </a>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[48px] rounded-full px-5 font-display text-[15px] font-medium text-muted underline underline-offset-4 hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
        >
          {t.offer_close}
        </button>
      </div>
    </Sheet>
  );
}
