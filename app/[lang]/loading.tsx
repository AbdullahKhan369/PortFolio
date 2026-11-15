/** Shown while a route segment loads. Language-neutral: a small prism with a travelling beam. */
export default function Loading() {
  return (
    <div className="pa-loading" role="status" aria-live="polite">
      <svg viewBox="0 0 64 40" width="64" height="40" aria-hidden="true" focusable="false">
        <path d="M24 6 L38 32 H10 Z" fill="none" stroke="#F2F4FF" strokeWidth="1.8" strokeLinejoin="round" />
        <path className="pa-loading-beam" d="M0 24 H17" stroke="#F2F4FF" strokeWidth="2" strokeLinecap="round" />
        <path d="M32 24 L60 16" stroke="#FFC857" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M32.5 26 L60 26" stroke="#4FE3B0" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M33 28 L60 36" stroke="#8A5CFF" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className="pa-sr">Loading</span>
    </div>
  );
}
