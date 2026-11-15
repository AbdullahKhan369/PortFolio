"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import en from "@/lib/i18n/messages/errors.en.json";
import ur from "@/lib/i18n/messages/errors.ur.json";

/**
 * not-found files do not receive route params, so the language comes from the URL.
 * Both message files are imported statically (tiny) instead of using the server loader.
 */
export default function NotFound() {
  const pathname = usePathname() || "/en";
  const lang = pathname.split("/")[1] === "ur" ? "ur" : "en";
  const t = lang === "ur" ? ur : en;

  return (
    <div className="grid min-h-[100dvh] place-items-start bg-base px-4 py-28 sm:px-8">
      <div className="mx-auto w-full max-w-[44rem]">
        <h1 className="font-display text-[clamp(2.25rem,8vw,4.5rem)] font-semibold leading-[1.05] text-text">{t.not_found_title}</h1>
        <p className="mt-6 max-w-[34rem] font-body text-[18px] leading-[1.75] text-muted">{t.not_found_body}</p>
        <Link
          href={`/${lang}`}
          className="mt-10 inline-flex min-h-[52px] items-center rounded-full bg-text px-8 font-display text-[16px] font-semibold text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure"
        >
          {t.home}
        </Link>
      </div>
    </div>
  );
}
