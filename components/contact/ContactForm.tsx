"use client";

import { useId, useRef, useState } from "react";
import type { Lang } from "@/lib/content/types";
import { buildWaLink } from "@/lib/whatsapp";
import { fmt } from "@/lib/api/format";
import { postInquiry, track } from "@/lib/api/track";

interface Props {
  lang: Lang;
  /** WhatsApp number from settings; empty hides the WhatsApp follow-up. */
  number: string;
  waMessage: string;
  t: Record<string, string>;
  newTab: string;
}

type Status = "idle" | "sending" | "sent" | "error";

const field =
  "mt-2 w-full rounded-none border border-text/25 bg-base px-4 py-3 font-body text-[16px] leading-snug text-text placeholder:text-muted/80 focus-visible:border-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure aria-[invalid=true]:border-amber";

/**
 * Contact form. Posts to /api/inquiries (source "form").
 * Errors say what to fix. The hidden `website` field is the honeypot.
 */
export default function ContactForm({ lang, number, waMessage, t, newTab }: Props) {
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<{ contact?: string; message?: string }>({});
  const [serverError, setServerError] = useState("");
  const [sentTo, setSentTo] = useState("");
  const contactRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const contact = String(form.get("contact") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const website = String(form.get("website") ?? "");

    const next: typeof errors = {};
    if (contact.length < 5) next.contact = t.err_contact;
    if (message.length < 5) next.message = t.err_message;
    setErrors(next);
    setServerError("");
    if (next.contact || next.message) {
      (next.contact ? contactRef.current : messageRef.current)?.focus();
      return;
    }

    setStatus("sending");
    const res = await postInquiry({ name: name || undefined, contact, message, source: "form", lang, website });
    if (res.ok) {
      track("contact_submit", { lang });
      setSentTo(contact);
      setStatus("sent");
      // Move focus to the confirmation so keyboard and screen-reader users land on it.
      requestAnimationFrame(() => headingRef.current?.focus());
    } else {
      setServerError(res.status === 400 ? res.error : `${res.error} ${t.err_fallback}`);
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="bg-surface p-6 sm:p-8">
        <h3 ref={headingRef} tabIndex={-1} className="font-display text-[1.5rem] font-semibold text-text outline-none">
          {t.success_title}
        </h3>
        <p className="mt-3 font-body text-[17px] leading-[1.7] text-muted">{fmt(t.success_body, { contact: sentTo })}</p>
        {number ? (
          <p className="mt-6 font-body text-[17px] leading-[1.7] text-text">
            <a
              href={buildWaLink({ number, message: waMessage })}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("cta_click", { where: "contact_success", lang })}
              className="inline-flex min-h-[48px] items-center rounded-full bg-wa px-6 font-display text-[16px] font-semibold text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
            >
              {t.wa_cta}
              <span className="sr-only"> ({newTab})</span>
            </a>
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 min-h-[44px] font-display text-[15px] font-medium text-muted underline underline-offset-4 hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
        >
          {t.send_another}
        </button>
      </div>
    );
  }

  const hasErrors = !!(errors.contact || errors.message);

  return (
    <form onSubmit={onSubmit} noValidate aria-describedby={hasErrors || serverError ? `${uid}-summary` : undefined} className="bg-surface p-6 sm:p-8">
      <h3 className="font-display text-[1.5rem] font-semibold text-text">{t.form_heading}</h3>

      <div id={`${uid}-summary`} role="alert" className="empty:hidden">
        {hasErrors ? <p className="mt-4 font-body text-[16px] leading-relaxed text-amber">{t.err_fix}</p> : null}
        {serverError ? <p className="mt-4 font-body text-[16px] leading-relaxed text-amber">{serverError}</p> : null}
      </div>

      <div className="mt-6">
        <label htmlFor={`${uid}-name`} className="font-display text-[15px] font-medium text-text">
          {t.name_label}
        </label>
        <input id={`${uid}-name`} name="name" type="text" autoComplete="name" maxLength={80} className={field} />
      </div>

      <div className="mt-5">
        <label htmlFor={`${uid}-contact`} className="font-display text-[15px] font-medium text-text">
          {t.contact_label}
        </label>
        <input
          ref={contactRef}
          id={`${uid}-contact`}
          name="contact"
          type="text"
          autoComplete="email"
          maxLength={120}
          required
          aria-required="true"
          aria-invalid={errors.contact ? true : undefined}
          aria-describedby={`${uid}-contact-help`}
          className={field}
        />
        <p id={`${uid}-contact-help`} className={`mt-2 font-body text-[14px] leading-relaxed ${errors.contact ? "text-amber" : "text-muted"}`}>
          {errors.contact || t.contact_help}
        </p>
      </div>

      <div className="mt-5">
        <label htmlFor={`${uid}-message`} className="font-display text-[15px] font-medium text-text">
          {t.message_label}
        </label>
        <textarea
          ref={messageRef}
          id={`${uid}-message`}
          name="message"
          rows={5}
          maxLength={2000}
          required
          aria-required="true"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? `${uid}-message-err` : undefined}
          placeholder={t.message_placeholder}
          className={`${field} resize-y`}
        />
        {errors.message ? (
          <p id={`${uid}-message-err`} className="mt-2 font-body text-[14px] leading-relaxed text-amber">
            {errors.message}
          </p>
        ) : null}
      </div>

      {/* Honeypot: invisible to people, tempting to bots. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-7 inline-flex min-h-[52px] items-center justify-center rounded-full bg-text px-8 font-display text-[16px] font-semibold text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure disabled:opacity-60"
      >
        {status === "sending" ? t.sending : t.send}
      </button>
    </form>
  );
}
