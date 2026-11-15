"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import en from "@/lib/i18n/messages/errors.en.json";
import ur from "@/lib/i18n/messages/errors.ur.json";

/** Route error boundary. Says what happened and what to do; shows the digest so a bug report is easy. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const pathname = usePathname() || "/en";
  const lang = pathname.split("/")[1] === "ur" ? "ur" : "en";
  const t = lang === "ur" ? ur : en;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[100dvh] place-items-start bg-base px-4 py-28 sm:px-8">
      <div className="mx-auto w-full max-w-[44rem]" role="alert">
        <h1 className="font-display text-[clamp(2.25rem,8vw,4.5rem)] font-semibold leading-[1.05] text-text">{t.error_title}</h1>
        <p className="mt-6 max-w-[34rem] font-body text-[18px] leading-[1.75] text-muted">{t.error_body}</p>
        {error.digest ? (
          <p className="mt-4 font-body text-[14px] text-muted">{t.error_code.replace("{code}", error.digest)}</p>
        ) : null}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-[52px] items-center rounded-full bg-text px-8 font-display text-[16px] font-semibold text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure"
          >
            {t.retry}
          </button>
          <Link
            href={`/${lang}`}
            className="inline-flex min-h-[52px] items-center rounded-full px-6 font-display text-[16px] font-medium text-muted underline underline-offset-4 hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
          >
            {t.home}
          </Link>
        </div>
      </div>
    </div>
  );
}
