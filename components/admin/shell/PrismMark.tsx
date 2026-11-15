// The one memorable thing in the admin: a beam entering a prism and splitting into the spectrum. Static.
export function PrismMark({ title }: { title?: string }) {
  return (
    <svg viewBox="0 0 120 120" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false">
      <line x1="4" y1="70" x2="46" y2="62" stroke="#F2F4FF" strokeWidth="3" strokeLinecap="round" />
      <polygon points="60,18 98,88 22,88" fill="#1B2050" stroke="#F2F4FF" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="72" y1="60" x2="116" y2="34" stroke="#8A5CFF" strokeWidth="3" strokeLinecap="round" />
      <line x1="74" y1="64" x2="116" y2="52" stroke="#3AA0FF" strokeWidth="3" strokeLinecap="round" />
      <line x1="76" y1="68" x2="116" y2="70" stroke="#4FE3B0" strokeWidth="3" strokeLinecap="round" />
      <line x1="78" y1="72" x2="116" y2="88" stroke="#FFC857" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
