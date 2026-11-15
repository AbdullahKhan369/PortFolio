import type { ElementType } from "react";

/**
 * Text that used to scramble letter by letter when the language changed. The scramble changed the text width every frame, which
 * made headings re-wrap and the whole layout jump, especially in Roman Urdu where the text is longer. It is now plain text;
 * the language change is covered by the spectrum curtain (LangWipe). The props are kept so every caller still works.
 */
export function Morph({ text, className, as: Tag = "span" }: { id?: string; text: string; className?: string; as?: ElementType }) {
  return <Tag className={className}>{text}</Tag>;
}
