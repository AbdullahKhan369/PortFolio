"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/content/types";
import { usePrefersReducedMotion } from "@/lib/device";
import TypingDots from "./TypingDots";
import ProcessReply from "./ProcessReply";
import styles from "./ProcessChat.module.css";

export interface ChatMessage {
  id: string;
  sender: "abdullah" | "client";
  text: string;
}

interface Props {
  lang: Lang;
  messages: ChatMessage[];
  /** WhatsApp number from settings. Empty hides the reply box (nothing real to open). */
  number: string;
  replyDefault: string;
  labels: {
    title: string;
    chatAria: string;
    typing: string;
    showAll: string;
    fromAbdullah: string;
    fromYou: string;
    reply: { label: string; placeholder: string; cta: string; hint: string; newTab: string };
  };
}

const typingMs = (text: string) => Math.min(1100, 350 + text.length * 9);

/**
 * WhatsApp-style chat. Messages appear as the person scrolls the chat into view:
 * scroll progress decides how many messages are due, a small queue plays them with a typing
 * indicator before Abdullah's lines. Scrolling is native and never hijacked, and messages
 * never disappear again once shown. Reduced motion: everything is shown at once.
 *
 * Layout: an invisible copy of the full conversation reserves the final height, so nothing
 * jumps while messages arrive. The live copy sits on top and is the aria-live log.
 */
export default function ProcessChat({ lang, messages, number, replyDefault, labels }: Props) {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const target = useRef(0);
  const shownRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = messages.length;
  const done = shown >= total;

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const showNow = useCallback((n: number) => {
    shownRef.current = n;
    setShown(n);
  }, []);

  // Plays queued messages one by one until `shown` catches up with `target`.
  const advance = useCallback(() => {
    if (timer.current) return;
    const next = shownRef.current;
    if (next >= target.current || next >= total) {
      setTyping(false);
      return;
    }
    const msg = messages[next];
    const delay = msg.sender === "abdullah" ? typingMs(msg.text) : 260;
    setTyping(msg.sender === "abdullah");
    timer.current = setTimeout(() => {
      timer.current = null;
      setTyping(false);
      showNow(next + 1);
      advance();
    }, delay);
  }, [messages, showNow, total]);

  const showAll = useCallback(() => {
    clearTimer();
    target.current = total;
    setTyping(false);
    showNow(total);
  }, [showNow, total]);

  useEffect(() => {
    if (reduced) {
      showAll();
      return;
    }
    const el = rootRef.current;
    if (!el) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      // 0 when the chat top reaches 85% of the viewport, 1 when its bottom reaches 75%.
      const start = vh * 0.85;
      const end = vh * 0.75;
      const span = rect.height + (start - end);
      const progress = Math.min(1, Math.max(0, (start - rect.top) / span));
      const due = progress <= 0 ? 0 : Math.max(1, Math.ceil(progress * total));
      if (due > target.current) {
        target.current = due;
        advance();
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      clearTimer();
    };
  }, [advance, reduced, showAll, total]);

  const bubble = (m: ChatMessage, live: boolean) => {
    const mine = m.sender === "client";
    return (
      <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
        <p
          style={{ ["--origin" as string]: mine ? "right bottom" : "left bottom" }}
          className={`${live && !reduced ? styles.arrive : ""} max-w-[86%] px-4 py-2.5 font-body text-[16px] leading-[1.55] text-text ${
            mine
              ? "rounded-[18px_18px_4px_18px] border border-wa/30 bg-wa/15"
              : "rounded-[18px_18px_18px_4px] bg-base"
          }`}
        >
          <span className="sr-only">{mine ? labels.fromYou : labels.fromAbdullah}: </span>
          {m.text}
        </p>
      </li>
    );
  };

  return (
    <div ref={rootRef} className="mx-auto w-full max-w-[440px] overflow-hidden [overflow-wrap:anywhere] rounded-[28px] bg-surface shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
      <div className="flex items-center gap-3 border-b border-text/10 px-4 py-3">
        <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" className="shrink-0 rounded-full bg-base">
          <defs>
            <linearGradient id="pc-prism" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#8A5CFF" />
              <stop offset="0.5" stopColor="#3AA0FF" />
              <stop offset="1" stopColor="#4FE3B0" />
            </linearGradient>
          </defs>
          <path d="M18 8 L28 26 H8 Z" fill="none" stroke="url(#pc-prism)" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        <p className="font-display text-[17px] font-semibold text-text">{labels.title}</p>
      </div>

      <div className="relative grid px-3 pb-4 pt-4">
        {/* Reserves the final height. Hidden from everyone, including screen readers. */}
        <ul aria-hidden="true" className="invisible col-start-1 row-start-1 m-0 flex list-none flex-col gap-2 p-0">
          {messages.map((m) => bubble(m, false))}
          <li className="h-[44px]" />
        </ul>

        {/* Live conversation. */}
        <div className="col-start-1 row-start-1">
          <ul
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            aria-label={labels.chatAria}
            className="m-0 flex list-none flex-col gap-2 p-0"
          >
            {messages.slice(0, shown).map((m) => bubble(m, true))}
          </ul>
          {typing && !done ? (
            <div className="mt-2">
              <TypingDots label={labels.typing} />
            </div>
          ) : null}
        </div>
      </div>

      {!done ? (
        <div className="border-t border-text/10 px-3 py-2">
          <button
            type="button"
            onClick={showAll}
            className="min-h-[44px] w-full rounded-full px-4 font-display text-[14px] font-medium text-muted underline underline-offset-4 hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
          >
            {labels.showAll}
          </button>
        </div>
      ) : null}

      {number ? (
        <ProcessReply lang={lang} number={number} defaultMessage={replyDefault} labels={labels.reply} />
      ) : null}
    </div>
  );
}
