"use client";
// Receipts "print" as they scroll into view: a clip reveals the paper top to bottom while a thin print head
// travels with the edge. Scroll-linked (native scrolling is untouched). Reduced motion and low-end devices
// get the finished receipts. Before hydration everything is visible, so no-JS visitors lose nothing.
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePerformanceTier, usePrefersReducedMotion } from "@/lib/device";
import type { Lang, MarketingCampaign } from "@/lib/content/types";
import Receipt, { type ReceiptProject } from "./Receipt";
import styles from "./marketing.module.css";

function Printed({
  campaign,
  lang,
  m,
  project,
  animate,
}: {
  campaign: MarketingCampaign;
  lang: Lang;
  m: Record<string, string>;
  project?: ReceiptProject | null;
  animate: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "end 0.78"] });
  const clip = useTransform(scrollYProgress, (v) => `inset(0 0 ${(1 - Math.min(1, Math.max(0, v))) * 100}% 0)`);
  const headTop = useTransform(scrollYProgress, (v) => `${Math.min(1, Math.max(0, v)) * 100}%`);
  const headOpacity = useTransform(scrollYProgress, [0, 0.03, 0.97, 1], [0, 1, 1, 0]);

  return (
    <li ref={ref} className={styles.item}>
      <motion.div className={styles.feed} style={animate ? { clipPath: clip, WebkitClipPath: clip } : undefined}>
        <Receipt c={campaign} lang={lang} m={m} project={project} />
      </motion.div>
      {animate && <motion.span className={styles.printHead} style={{ top: headTop, opacity: headOpacity }} aria-hidden="true" />}
    </li>
  );
}

export default function ReceiptStack({
  campaigns,
  lang,
  m,
  label,
  projects,
}: {
  campaigns: MarketingCampaign[];
  lang: Lang;
  m: Record<string, string>;
  label?: string;
  projects?: Record<string, ReceiptProject>;
}) {
  const tier = usePerformanceTier();
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const animate = ready && tier === "high" && !reduced;

  return (
    <div>
      <div className={styles.slot} aria-hidden="true">
        <span className={styles.slotLight} />
      </div>
      <ol className={styles.list} aria-label={label ?? m.heading}>
        {campaigns.map((c) => (
          <Printed
            key={c.id}
            campaign={c}
            lang={lang}
            m={m}
            project={c.project_id && projects ? projects[c.project_id] ?? null : null}
            animate={animate}
          />
        ))}
      </ol>
    </div>
  );
}
