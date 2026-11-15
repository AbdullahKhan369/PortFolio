"use client";

import { useId, useState } from "react";
import type { Lang } from "@/lib/content/types";
import { buildWaLink } from "@/lib/whatsapp";
import { track } from "@/lib/api/track";

interface Props {
  lang: Lang;
  number: string;
  defaultMessage: string;
  labels: { label: string; placeholder: string; cta: string; hint: string; newTab: string };
}

/**
 * The real reply box at the end of the chat. Nothing is sent from here:
 * the button opens WhatsApp with the typed text as the prefilled message.
 */
export default function ProcessReply({ lang, number, defaultMessage, labels }: Props) {
  const id = useId();
  const [text, setText] = useState("");
  const href = buildWaLink({ number, message: text.trim() || defaultMessage });

  return (
    <div className="border-t border-text/10 bg-surface px-3 pb-3 pt-3">
      <label htmlFor={id} className="sr-only">
        {labels.label}
      </label>
      <div className="flex items-end gap-2">
        <textarea
          id={id}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder={labels.placeholder}
          aria-describedby={`${id}-hint`}
          className="min-h-[48px] w-full resize-none rounded-[20px] bg-base px-4 py-3 font-body text-[16px] leading-snug text-text placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wa"
        />
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("cta_click", { where: "process_reply", lang })}
          className="inline-flex min-h-[48px] max-w-full items-center justify-center rounded-full py-2 text-center leading-tight bg-wa px-5 font-display text-[15px] font-semibold text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
        >
          {labels.cta}
          <span className="sr-only"> ({labels.newTab})</span>
        </a>
      </div>
      <p id={`${id}-hint`} className="mt-2 px-1 font-body text-[13px] leading-relaxed text-muted">
        {labels.hint}
      </p>
    </div>
  );
}
