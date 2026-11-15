/** The brand mark: a beam of white light entering a prism and leaving as four spectral rays. Decorative. */
export function PrismGlyph({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M1 18.5 H10.2" stroke="#F2F4FF" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M16 5 L26 23 H6 Z" stroke="#F2F4FF" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(242,244,255,.08)" />
      <path d="M20.4 19 L31 13.6" stroke="#FFC857" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M20.7 20 L31 19.4" stroke="#4FE3B0" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M21 21 L31 25" stroke="#3AA0FF" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M21.3 22 L30 30" stroke="#8A5CFF" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
