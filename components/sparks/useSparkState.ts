"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/api/track";

const KEY = "prismarc.sparks.v1";

export type OfferMode = "found" | "skipped";

interface Stored {
  found: number[];
  hidden: boolean;
}

function load(): Stored {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { found: [], hidden: false };
    const parsed = JSON.parse(raw) as Partial<Stored>;
    return {
      found: Array.isArray(parsed.found) ? parsed.found.filter((n) => [3, 6, 9].includes(n)) : [],
      hidden: parsed.hidden === true,
    };
  } catch {
    return { found: [], hidden: false };
  }
}

function save(value: Stored) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* private mode or blocked storage: the hunt still works for this visit */
  }
}

/** State and actions for the 3-6-9 hunt. Storage is optional; nothing depends on it. */
export function useSparkState(total: number) {
  const [ready, setReady] = useState(false);
  const [found, setFound] = useState<number[]>([]);
  const [hidden, setHidden] = useState(false);
  const [offer, setOffer] = useState<OfferMode | null>(null);
  const [lastFound, setLastFound] = useState<number | null>(null);
  const foundRef = useRef<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = load();
    foundRef.current = stored.found;
    setFound(stored.found);
    setHidden(stored.hidden);
    setReady(true);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const collect = useCallback(
    (n: number) => {
      if (foundRef.current.includes(n)) return;
      const next = [...foundRef.current, n];
      foundRef.current = next;
      setFound(next);
      setLastFound(n);
      save({ found: next, hidden: false });
      track("spark_found", { n });
      if (next.length >= total) {
        track("audit_unlocked");
        timer.current = setTimeout(() => setOffer("found"), 900);
      }
    },
    [total]
  );

  const skip = useCallback(() => {
    track("audit_skipped");
    setOffer("skipped");
  }, []);

  const hide = useCallback(() => {
    setHidden(true);
    save({ found: foundRef.current, hidden: true });
  }, []);

  const openOffer = useCallback(() => setOffer("found"), []);
  const closeOffer = useCallback(() => setOffer(null), []);

  return { ready, found, hidden, offer, lastFound, collect, skip, hide, openOffer, closeOffer };
}
