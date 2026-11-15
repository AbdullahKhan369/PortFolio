// Presentational device frames. No hooks, so they work in server and client components.
import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./work.module.css";
import { cx } from "./utils";

export function ScreenPlaceholder({ label }: { label: string }) {
  return (
    <div className={styles.ph} aria-hidden="true">
      <div className={styles.phBars}>
        <span />
        <span />
        <span />
      </div>
      <span>{label}</span>
    </div>
  );
}

export function ScreenImage({ src, alt, sizes, priority }: { src: string; alt: string; sizes: string; priority?: boolean }) {
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={styles.screenImg} />;
}

export function LaptopShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx(styles.laptop, styles.bezel, className)}>
      <div className={styles.laptopLid}>
        <div className={styles.laptopScreen}>{children}</div>
      </div>
      <div className={styles.laptopBase} aria-hidden="true" />
    </div>
  );
}

export function PhoneShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx(styles.phone, styles.bezel, className)}>
      <span className={styles.phoneIsland} aria-hidden="true" />
      <div className={styles.phoneScreen}>{children}</div>
    </div>
  );
}

interface FrameProps {
  src?: string | null;
  alt: string;
  pendingLabel: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export function LaptopFrame({ src, alt, pendingLabel, sizes = "(min-width: 1024px) 52vw, 92vw", priority, className }: FrameProps) {
  return (
    <LaptopShell className={className}>
      {src ? <ScreenImage src={src} alt={alt} sizes={sizes} priority={priority} /> : <ScreenPlaceholder label={pendingLabel} />}
    </LaptopShell>
  );
}

export function PhoneFrame({ src, alt, pendingLabel, sizes = "(min-width: 1024px) 14vw, 30vw", priority, className }: FrameProps) {
  return (
    <PhoneShell className={className}>
      {src ? <ScreenImage src={src} alt={alt} sizes={sizes} priority={priority} /> : <ScreenPlaceholder label={pendingLabel} />}
    </PhoneShell>
  );
}
