import styles from "./ProcessChat.module.css";

/** Three-dot typing indicator. The label is read by screen readers via the parent aria-live log. */
export default function TypingDots({ label }: { label: string }) {
  return (
    <div
      className={`${styles.arrive} inline-flex items-center gap-1.5 rounded-[18px_18px_18px_4px] bg-base px-4 py-3`}
      role="status"
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className={styles.dot} />
      <span aria-hidden="true" className={styles.dot} />
      <span aria-hidden="true" className={styles.dot} />
    </div>
  );
}
