"use client";
// Laptop + phone composition for one project band. The phone drifts slightly against the laptop while
// the band scrolls past (high-performance devices only). Low tier and reduced motion get a still image.
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePerformanceTier, usePrefersReducedMotion } from "@/lib/device";
import { LaptopShell, PhoneShell, ScreenImage, ScreenPlaceholder } from "./DeviceFrame";
import LiveFrame from "./LiveFrame";
import styles from "./work.module.css";
import { cx } from "./utils";

export interface SceneShot {
  src: string;
  alt: string;
}

interface Props {
  desktop?: SceneShot | null;
  mobile?: SceneShot | null;
  pendingLabel: string;
  className?: string;
  priority?: boolean;
  /** Deployed site to preview live inside the screens. Screenshots (when present) stay as the poster. */
  liveUrl?: string | null;
  liveTitle?: string;
  liveLabels?: { explore: string; done: string; badge: string };
}

export default function DeviceScene({ desktop, mobile, pendingLabel, className, priority, liveUrl, liveTitle, liveLabels }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const tier = usePerformanceTier();
  const reduced = usePrefersReducedMotion();
  const animate = tier === "high" && !reduced;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const phoneY = useTransform(scrollYProgress, [0, 1], [26, -26]);
  const laptopY = useTransform(scrollYProgress, [0, 1], [8, -8]);

  // Phone-only projects (no desktop shot but a phone shot) get a single larger phone.
  const solo = !desktop && !!mobile;

  return (
    <div ref={ref} className={cx(styles.sceneBg, className)}>
      <div className={cx(styles.scene, solo && styles.sceneSolo)}>
        {!solo && (
          <motion.div className={styles.sceneLaptop} style={animate ? { y: laptopY } : undefined}>
            <LaptopShell>
              {liveUrl && liveLabels ? (
                <LiveFrame
                  url={liveUrl}
                  title={liveTitle ?? ""}
                  vw={1280}
                  vh={800}
                  interactive
                  exploreLabel={liveLabels.explore}
                  doneLabel={liveLabels.done}
                  badgeLabel={liveLabels.badge}
                  poster={desktop ? <ScreenImage src={desktop.src} alt={desktop.alt} sizes="(min-width: 1024px) 52vw, 92vw" priority={priority} /> : <ScreenPlaceholder label="" />}
                />
              ) : desktop ? (
                <ScreenImage src={desktop.src} alt={desktop.alt} sizes="(min-width: 1024px) 52vw, 92vw" priority={priority} />
              ) : (
                <ScreenPlaceholder label={pendingLabel} />
              )}
            </LaptopShell>
          </motion.div>
        )}
        {(mobile || !solo) && (
          <motion.div className={styles.scenePhone} style={animate ? { y: phoneY } : undefined}>
            <PhoneShell>
              {mobile ? (
                <ScreenImage src={mobile.src} alt={mobile.alt} sizes="(min-width: 1024px) 14vw, 30vw" />
              ) : liveUrl && liveLabels ? (
                <LiveFrame url={liveUrl} title={liveTitle ?? ""} vw={390} vh={830} exploreLabel={liveLabels.explore} doneLabel={liveLabels.done} badgeLabel={liveLabels.badge} poster={<ScreenPlaceholder label="" />} />
              ) : (
                <ScreenPlaceholder label={pendingLabel} />
              )}
            </PhoneShell>
          </motion.div>
        )}
      </div>
    </div>
  );
}
