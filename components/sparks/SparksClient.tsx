"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Lang } from "@/lib/content/types";
import { fmt } from "@/lib/api/format";
import { SPARK_SPOTS } from "./positions";
import { useSparkState } from "./useSparkState";
import Spark from "./Spark";
import AuditSheet from "./AuditSheet";
import styles from "./Sparks.module.css";

interface Props {
  lang: Lang;
  number: string;
  offerText: string;
  t: Record<string, string>;
  newTab: string;
}

/**
 * The 3-6-9 hunt. Three small buttons are portaled into the SparkAnchor of the sections `achievements`,
 * `systems` and `about` (contract section 8). A fixed bar (z 45) shows progress and always offers
 * "Skip the hunt", which opens the same free-audit offer. Nothing here blocks the page:
 * no scroll lock, no overlay until the visitor opens the offer themselves.
 */
export default function SparksClient({ lang, number, offerText, t, newTab }: Props) {
  const [hosts, setHosts] = useState<Record<number, HTMLElement>>({});
  const [revealed, setRevealed] = useState(false);
  const [explain, setExplain] = useState(false);
  const [status, setStatus] = useState("");

  const total = Math.max(1, Object.keys(hosts).length);
  const s = useSparkState(total);

  // Find the spark anchors that each section renders (SparkAnchor) and wait until React has hydrated them,
  // so the page DOM is never touched before hydration is finished.
  useEffect(() => {
    const isHydrated = (el: Element): boolean => Object.keys(el).some((k) => k.startsWith("__reactFiber$") || k.startsWith("__reactContainer$"));
    const map: Record<number, HTMLElement> = {};
    let tries = 0;
    const scan = (): void => {
      tries += 1;
      let changed = false;
      for (const spot of SPARK_SPOTS) {
        if (map[spot.n]) continue;
        const el = document.querySelector<HTMLElement>(`[data-spark-layer="${spot.n}"]`);
        if (el && isHydrated(el)) {
          map[spot.n] = el;
          changed = true;
        }
      }
      if (changed) setHosts({ ...map });
      if (Object.keys(map).length >= SPARK_SPOTS.length || tries > 60) window.clearInterval(timer);
    };
    const timer = window.setInterval(scan, 250);
    scan();
    return () => window.clearInterval(timer);
  }, []);

  // The bar waits until the visitor has scrolled a little, so it never competes with the hero.
  useEffect(() => {
    if (revealed) return;
    const check = () => {
      if (window.scrollY > window.innerHeight * 0.5) setRevealed(true);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [revealed]);

  // Screen-reader announcement for the latest spark.
  useEffect(() => {
    if (s.lastFound == null) return;
    const count = s.found.length;
    setStatus(count >= total ? t.all_found : fmt(t.found_status, { n: s.lastFound, found: count, total }));
  }, [s.lastFound, s.found.length, total, t]);

  const spots = useMemo(() => SPARK_SPOTS.filter((spot) => hosts[spot.n]), [hosts]);

  if (!s.ready || s.hidden || spots.length === 0) return null;

  const allFound = s.found.length >= total;
  const barVisible = revealed || s.found.length > 0 || s.offer !== null;

  return (
    <>
      {spots.map((spot) =>
        createPortal(
          <Spark
            key={spot.n}
            spot={spot}
            found={s.found.includes(spot.n)}
            label={fmt(t.spark_label, { n: spot.n })}
            doneLabel={fmt(t.spark_done_label, { n: spot.n })}
            onCollect={s.collect}
          />,
          hosts[spot.n],
          `spark-${spot.n}`
        )
      )}

      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      {barVisible ? (
        <div
          role="region"
          aria-label={t.pill_label}
          style={{
            position: "fixed",
            zIndex: 45,
            left: 12,
            bottom: "calc(var(--safe-bottom, 0px) + 12px)",
            maxWidth: "calc(100vw - 24px)",
          }}
          className={`${styles.rise} bg-surface text-text shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)] rounded-[20px]`}
        >
          {explain ? (
            <p id="sparks-hint" className="max-w-[300px] px-4 pb-1 pt-4 font-body text-[14px] leading-[1.6] text-muted">
              {t.hint}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-1 gap-y-0 p-1.5">
            <button
              type="button"
              aria-expanded={explain}
              aria-controls="sparks-hint"
              onClick={() => setExplain((v) => !v)}
              className="flex min-h-[44px] items-center gap-2 rounded-full px-3 font-display text-[14px] font-medium text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
            >
              <span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full border border-amber text-[10px] font-semibold text-amber">
                {s.found.length}
              </span>
              <span>
                {t.pill_label}: {fmt(t.count, { found: s.found.length, total })}
              </span>
            </button>

            {allFound ? (
              <button
                type="button"
                onClick={s.openOffer}
                className="min-h-[44px] rounded-full bg-text px-4 font-display text-[14px] font-semibold text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure"
              >
                {t.sheet_title}
              </button>
            ) : (
              <button
                type="button"
                onClick={s.skip}
                className="min-h-[44px] rounded-full px-3 font-display text-[14px] font-medium text-muted underline underline-offset-4 hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
              >
                {t.skip}
              </button>
            )}

            <button
              type="button"
              onClick={s.hide}
              aria-label={t.hide_label}
              className="grid min-h-[44px] min-w-[44px] place-items-center rounded-full font-display text-[18px] leading-none text-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </div>
      ) : null}

      <AuditSheet
        open={s.offer !== null}
        mode={s.offer ?? "skipped"}
        lang={lang}
        number={number}
        offerText={offerText}
        t={t}
        newTab={newTab}
        onClose={s.closeOffer}
      />
    </>
  );
}
