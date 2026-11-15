"use client";
// Pinned scroll stack. On wide, tall, high-performance screens every band sticks under the header and the
// next band slides over it (native sticky: scrolling is never hijacked). The covered band settles back a
// little (scale + dim) as the next one arrives. On phones, tablets, low-end devices and reduced motion the
// bands are a plain vertical list.
import { createRef, useEffect, useMemo, useState, type ReactNode, type RefObject } from "react";
import { motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import { usePerformanceTier, usePrefersReducedMotion } from "@/lib/device";
import styles from "./work.module.css";
import { cssVars, cx } from "./utils";

export interface StackItem {
  id: string;
  node: ReactNode;
}

function Layer({
  index,
  stacked,
  selfRef,
  nextRef,
  children,
}: {
  index: number;
  stacked: boolean;
  selfRef: RefObject<HTMLLIElement | null>;
  nextRef: RefObject<HTMLLIElement | null> | undefined;
  children: ReactNode;
}) {
  const zero = useMotionValue(0);
  // Progress of the NEXT band travelling from the bottom of the screen up to the sticky line.
  const { scrollYProgress } = useScroll({ target: nextRef ?? selfRef, offset: ["start end", "start 25%"] });
  const p = nextRef ? scrollYProgress : zero;
  const scale = useTransform(p, [0, 1], [1, 0.95]);
  const opacity = useTransform(p, [0, 1], [1, 0.5]);

  return (
    <li ref={selfRef} className={styles.item} style={cssVars({ "--i": index })}>
      <motion.div className={styles.itemInner} style={stacked ? { scale, opacity } : undefined}>
        {children}
      </motion.div>
    </li>
  );
}

export default function DeviceStack({ items, label }: { items: StackItem[]; label: string }) {
  const tier = usePerformanceTier();
  const reduced = usePrefersReducedMotion();
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (min-height: 700px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const stacked = wide && tier === "high" && !reduced;
  const refs = useMemo(() => items.map(() => createRef<HTMLLIElement>()), [items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ol className={cx(styles.stack, stacked && styles.stackOn)} aria-label={label}>
      {items.map((it, i) => (
        <Layer key={it.id} index={i} stacked={stacked} selfRef={refs[i]} nextRef={refs[i + 1]}>
          {it.node}
        </Layer>
      ))}
    </ol>
  );
}
