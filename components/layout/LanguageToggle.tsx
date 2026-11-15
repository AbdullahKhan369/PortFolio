"use client";

import { startTransition, useEffect, useState, type MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Lang } from "@/lib/content/types";
import { LANG_COOKIE, LANG_COOKIE_MAX_AGE } from "@/lib/i18n/config";

export interface LanguageToggleLabels {
  group: string;
  en: string;
  ur: string;
  enShort: string;
  urShort: string;
}

/** `/en/work/x` -> `/ur/work/x`. */
function switchPath(pathname: string | null, to: Lang): string {
  const p = pathname ?? "/";
  if (/^\/(en|ur)(?=\/|$)/.test(p)) return p.replace(/^\/(en|ur)(?=\/|$)/, `/${to}`);
  return `/${to}`;
}

function persist(to: Lang): void {
  try {
    document.cookie = `${LANG_COOKIE}=${to}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; samesite=lax`;
    window.localStorage.setItem("pa-lang", to);
  } catch {
    /* storage can be blocked; the route still carries the language */
  }
}

function trackSwitch(to: Lang): void {
  try {
    const body = JSON.stringify({ name: "language_switch", path: window.location.pathname, meta: { to } });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
  } catch {
    /* ignore */
  }
}

/**
 * EN / Roman Urdu switch. Route based (/en <-> /ur) so it works without JavaScript and each
 * option is a real link with hreflang. With JavaScript the click drops the spectrum curtain (LangWipe),
 * remembers the choice, and navigates without losing the scroll position.
 */
export function LanguageToggle({ lang, labels }: { lang: Lang; labels: LanguageToggleLabels }) {
  const pathname = usePathname();
  const router = useRouter();
  const [active, setActive] = useState<Lang>(lang);

  useEffect(() => {
    setActive(lang);
  }, [lang]);

  const go = (e: MouseEvent<HTMLAnchorElement>, to: Lang): void => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (to === lang) return;
    setActive(to);
    persist(to);
    trackSwitch(to);
    const url = `${switchPath(pathname, to)}${window.location.hash}`;
    const root = document.documentElement;
    const animate = root.getAttribute("data-motion") !== "reduce";
    if (animate) root.setAttribute("data-wipe", "in");
    window.setTimeout(() => startTransition(() => router.push(url, { scroll: false })), animate ? 420 : 0);
  };

  const options: { code: Lang; short: string; name: string; tag: string }[] = [
    { code: "en", short: labels.enShort, name: labels.en, tag: "en" },
    { code: "ur", short: labels.urShort, name: labels.ur, tag: "ur-Latn" },
  ];

  return (
    <div className="pa-lang" role="group" aria-label={labels.group} data-active={active}>
      <span className="pa-lang-pill" aria-hidden="true" />
      {options.map((o) => (
        <a
          key={o.code}
          className="pa-lang-opt"
          href={switchPath(pathname, o.code)}
          hrefLang={o.tag}
          lang={o.tag}
          aria-label={o.name}
          aria-current={active === o.code ? "true" : undefined}
          onClick={(e) => go(e, o.code)}
        >
          {o.short}
        </a>
      ))}
    </div>
  );
}
