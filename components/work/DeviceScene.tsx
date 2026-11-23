"use client";
// Laptop + phone composition for one project band. The phone drifts slightly against the laptop while
// the band scrolls past (high-performance devices only). Low tier and reduced motion get a still image.
import { useRef, type PointerEvent } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionStyle } from "framer-motion";
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

  // Device wall: the lid swings open and wakes as the band arrives, the phone slides in beside it,
  // a glare sweeps the screen, and with a mouse the laptop tilts toward the pointer.
  const lidDeg = useTransform(scrollYProgress, [0.02, 0.27], [-82, 0], { clamp: true });
  const lid = useTransform(lidDeg, (v) => `${v.toFixed(1)}deg`);
  const wake = useTransform(scrollYProgress, [0.02, 0.27], [0.3, 1], { clamp: true });
  const phoneX = useTransform(scrollYProgress, [0.1, 0.34], [90, 0], { clamp: true });
  const phoneOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1], { clamp: true });
  const glareX = useTransform(scrollYProgress, [0.15, 0.6], ["-120%", "120%"]);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const tiltY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 110, damping: 16, mass: 0.6 });
  const tiltX = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 110, damping: 16, mass: 0.6 });
  const onMove = (e: PointerEvent<HTMLDivElement>): void => {
    if (!animate || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = (): void => {
    mx.set(0);
    my.set(0);
  };

  // Phone-only projects (no desktop shot but a phone shot) get a single larger phone.
  const solo = !desktop && !!mobile;

  return (
    <div ref={ref} className={cx(styles.sceneBg, className)} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className={cx(styles.scene, solo && styles.sceneSolo)}>
        {!solo && (
          <motion.div
            className={cx(styles.sceneLaptop, animate && styles.sceneLaptopOn)}
            style={animate ? ({ y: laptopY, rotateX: tiltX, rotateY: tiltY, transformPerspective: 1500, "--lid": lid, "--wake": wake } as MotionStyle) : undefined}
          >
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
            {animate ? <motion.span className={styles.sceneGlare} style={{ x: glareX }} aria-hidden="true" /> : null}
          </motion.div>
        )}
        {(mobile || !solo) && (
          <motion.div className={styles.scenePhone} style={animate ? { y: phoneY, x: phoneX, opacity: phoneOpacity } : undefined}>
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
